import { ensureUrlProtocol } from './urlUtils';

describe('ensureUrlProtocol', () => {
  describe('safe protocols', () => {
    it('should preserve http:// URLs', () => {
      expect(ensureUrlProtocol('http://example.com')).toBe('http://example.com');
    });

    it('should preserve https:// URLs', () => {
      expect(ensureUrlProtocol('https://example.com')).toBe('https://example.com');
    });

    it('should preserve mailto: URLs', () => {
      expect(ensureUrlProtocol('mailto:user@example.com')).toBe('mailto:user@example.com');
    });

    it('should preserve tel: URLs', () => {
      expect(ensureUrlProtocol('tel:+1234567890')).toBe('tel:+1234567890');
    });

    it('should preserve ftp:// URLs', () => {
      expect(ensureUrlProtocol('ftp://files.example.com')).toBe('ftp://files.example.com');
    });

    it('should preserve ftps:// URLs', () => {
      expect(ensureUrlProtocol('ftps://files.example.com')).toBe('ftps://files.example.com');
    });

    it('should handle mixed case protocols', () => {
      expect(ensureUrlProtocol('HTTP://example.com')).toBe('HTTP://example.com');
      expect(ensureUrlProtocol('HTTPS://example.com')).toBe('HTTPS://example.com');
      expect(ensureUrlProtocol('MailTo:user@example.com')).toBe('MailTo:user@example.com');
    });
  });

  describe('XSS prevention - dangerous protocols', () => {
    it('should sanitize javascript: protocol by prepending https://', () => {
      const result = ensureUrlProtocol('javascript:alert(1)');
      expect(result).toBe('https://javascript:alert(1)');
      expect(result).not.toMatch(/^javascript:/i);
    });

    it('should sanitize data: protocol by prepending https://', () => {
      const result = ensureUrlProtocol('data:text/html,<script>alert(1)</script>');
      expect(result).toBe('https://data:text/html,<script>alert(1)</script>');
      expect(result).not.toMatch(/^data:/i);
    });

    it('should sanitize vbscript: protocol by prepending https://', () => {
      const result = ensureUrlProtocol('vbscript:alert(1)');
      expect(result).toBe('https://vbscript:alert(1)');
      expect(result).not.toMatch(/^vbscript:/i);
    });

    it('should sanitize file: protocol by prepending https://', () => {
      const result = ensureUrlProtocol('file:///etc/passwd');
      expect(result).toBe('https://file:///etc/passwd');
      expect(result).not.toMatch(/^file:/i);
    });

    it('should sanitize mixed case javascript: protocol', () => {
      const result = ensureUrlProtocol('JaVaScRiPt:alert(1)');
      expect(result).toBe('https://JaVaScRiPt:alert(1)');
      expect(result).not.toMatch(/^javascript:/i);
    });
  });

  describe('relative URLs', () => {
    it('should preserve absolute paths starting with /', () => {
      expect(ensureUrlProtocol('/path/to/page')).toBe('/path/to/page');
    });

    it('should preserve relative paths starting with ./', () => {
      expect(ensureUrlProtocol('./relative/path')).toBe('./relative/path');
    });

    it('should preserve parent paths starting with ../', () => {
      expect(ensureUrlProtocol('../parent/path')).toBe('../parent/path');
    });

    it('should preserve fragment identifiers starting with #', () => {
      expect(ensureUrlProtocol('#section')).toBe('#section');
    });
  });

  describe('domain names without protocol', () => {
    it('should add https:// to domain names', () => {
      expect(ensureUrlProtocol('example.com')).toBe('https://example.com');
    });

    it('should add https:// to www domains', () => {
      expect(ensureUrlProtocol('www.example.com')).toBe('https://www.example.com');
    });

    it('should add https:// to subdomains', () => {
      expect(ensureUrlProtocol('subdomain.example.com')).toBe('https://subdomain.example.com');
    });

    it('should add https:// to domains with paths', () => {
      expect(ensureUrlProtocol('example.com/path/to/page')).toBe('https://example.com/path/to/page');
    });

    it('should add https:// to domains with query strings', () => {
      expect(ensureUrlProtocol('example.com?query=value')).toBe('https://example.com?query=value');
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      expect(ensureUrlProtocol('')).toBe('');
    });

    it('should handle whitespace-only strings', () => {
      expect(ensureUrlProtocol('   ')).toBe('   ');
    });

    it('should trim whitespace before processing', () => {
      expect(ensureUrlProtocol('  https://example.com  ')).toBe('https://example.com');
      expect(ensureUrlProtocol('  example.com  ')).toBe('https://example.com');
    });

    it('should handle URLs with ports', () => {
      expect(ensureUrlProtocol('https://example.com:8080')).toBe('https://example.com:8080');
      expect(ensureUrlProtocol('example.com:8080')).toBe('https://example.com:8080');
    });

    it('should handle localhost', () => {
      expect(ensureUrlProtocol('http://localhost:3000')).toBe('http://localhost:3000');
      expect(ensureUrlProtocol('localhost:3000')).toBe('https://localhost:3000');
    });

    it('should handle IP addresses', () => {
      expect(ensureUrlProtocol('http://192.168.1.1')).toBe('http://192.168.1.1');
      expect(ensureUrlProtocol('192.168.1.1')).toBe('https://192.168.1.1');
    });
  });
});