import React from 'react';
import { getBackendSrv, config } from '@grafana/runtime';
import { dateTime } from '@grafana/data';
import { Buffer } from 'buffer';
import { Alert } from '@grafana/ui';

async function decrypt(cipherText: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    Buffer.from('JHJhQ3xefHVoIzVHUD0wSg==', 'base64'),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const buffer = Buffer.from(cipherText, 'base64');
  const nonce = buffer.subarray(0, 12);
  const data = buffer.subarray(12);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
    },
    key,
    data
  );

  return new TextDecoder().decode(decrypted);
}

async function importRsaPublicKey() {
  const pem = `
MIIBCgKCAQEA2gA2lRtZoQbovt03x2mwtKXRNJY+PcX7vZXYQTLeQWMYMBHG+40I
TQ1mkZfGqTEAXX5zwqZP6UBcvg+vGkP5VzxFy3SZrftd5c5XN+CnD3Zcvar4muI/
qEC0SoyW3u5r4HEz/zIpgEmhLjUnu3hcsfN94GDtc17kyO2XiVsxpl20dUiBT4TD
QCJM+bazE1IpnP7nXTfu+F4wXL6m0iRCHUuVphtOEmUtIhgQ0+1xiszF2utIYr8V
5CuOH3lzfKKwdYUIG4oGhhPb3PRcz6rXSKwLFQDc24uUNE9KcgLkSR8qIW+GYEF+
rabOjpOMw2Ajx2ojcgt2kW4++JfxC/oADQIDAQAB`;

  const pemContents = pem.split('\n').join('');

  // To convert to SPKI, I have to prepend the algorithm identifier
  // ASN.1 structure for RSA keys. It typically looks like this in hex:
  const algoIdentifier = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A';
  const binaryDer = str2ab(atob(algoIdentifier + pemContents));

  const publicKey = await crypto.subtle.importKey(
    'spki',
    binaryDer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' },
    },
    true,
    ['verify']
  );

  return publicKey;
}

// Convert from a binary string to an ArrayBuffer
function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

async function verifySignature(text: string, signatureBuffer: Uint8Array) {
  const publicKey = await importRsaPublicKey();

  const textBuffer = new TextEncoder().encode(text);
  return crypto.subtle.verify(
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' },
    },
    publicKey,
    signatureBuffer as unknown as BufferSource,
    textBuffer
  );
}

function isCloudVersion() {
  const regex = /^(https?:\/\/)([\w-]+\.)?kensobi\.com/;
  return regex.test(config.appUrl) && regex.test(window.location.href);
}

export async function checkToken(): Promise<boolean> {
  try {
    if (isCloudVersion()) {
      return true;
    }
    const response = await getBackendSrv().post(`/api/plugins/kensobi-admin-app/resources/checkLicense`);
    const plain = await decrypt(response.token);

    const parts = plain.split('.');
    const exp = parseInt(parts[2], 10);

    if (isNaN(exp)) {
      return false;
    }
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (exp < currentTimestamp) {
      return false;
    }

    const signatureBuffer = new Uint8Array(Buffer.from(parts[1], 'base64'));
    const text = Buffer.from(parts[0], 'base64').toString('utf-8');

    if (!(await verifySignature(text, signatureBuffer))) {
      return false;
    }

    const licenseContent = JSON.parse(text);

    const licenseExpiry = licenseContent.expiry;
    if (licenseExpiry == null) {
      return false;
    }
    if (licenseExpiry !== 'never') {
      const expiryDate = dateTime(licenseExpiry, 'YYYY-MM-DD').toDate();
      if (isNaN(expiryDate.getTime()) || expiryDate < new Date()) {
        return false;
      }
    }

    return true;
  } catch (err) {
    return false;
  }
}

export const useCheckToken = () => {
  const [token, setToken] = React.useState<'loading' | 'yes' | 'no'>('loading');

  React.useEffect(() => {
    checkToken().then((isValid) => setToken(isValid ? 'yes' : 'no'));
  }, []);

  return token;
};

export function withCheckToken(Component: React.ComponentType<any>) {
  const Wrapper = (props: any) => {
    const token = useCheckToken();

    if (token === 'loading') {
      return <div>Loading...</div>;
    }

    if (token === 'no') {
      return <Alert title="License not found" severity="error" />;
    }

    //@ts-ignore
    return <Component {...props} />;
  };

  return Wrapper;
}
