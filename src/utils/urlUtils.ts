/**
 * Allowlist of safe URL protocols that can be used in links.
 * Excludes dangerous protocols like javascript:, data:, vbscript:, etc.
 * that could lead to XSS attacks.
 */
const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:', 'ftp:', 'ftps:'];

/**
 * Ensures a URL has a safe protocol prefix when appropriate.
 * - Accepts URLs with safe protocols (http://, https://, mailto:, tel:, ftp://, ftps://)
 * - Leaves relative URLs unchanged (/, ./, ../, #)
 * - Adds https:// to domain-like strings (www.example.com, example.com)
 * - BLOCKS dangerous protocols (javascript:, data:, vbscript:, etc.) by treating them as domains
 *
 * This prevents URLs like "www.example.com" from being treated as relative paths
 * while preserving intentional relative URLs and preventing XSS attacks.
 *
 * @param url - The URL to sanitize
 * @returns The URL with a protocol prefix if needed, or sanitized to prevent XSS
 */
export function ensureUrlProtocol(url: string): string {
  if (!url || url.trim().length === 0) {
    return url;
  }

  const trimmedUrl = url.trim();

  // Check if it's a relative URL (starts with /, ./, ../, or #)
  const isRelative = /^(\/|\.\/|\.\.\/|#)/i.test(trimmedUrl);
  if (isRelative) {
    return trimmedUrl;
  }

  // Check if URL has a protocol
  const protocolMatch = /^([a-zA-Z][a-zA-Z0-9+.-]*:)/i.exec(trimmedUrl);
  if (protocolMatch) {
    const protocol = protocolMatch[1].toLowerCase();

    // Only allow safe protocols - block javascript:, data:, vbscript:, etc.
    if (SAFE_PROTOCOLS.includes(protocol)) {
      return trimmedUrl;
    }

    // Dangerous protocol detected - treat as domain and prepend https://
    // This neutralizes attempts like "javascript:alert(1)" by converting to
    // "https://javascript:alert(1)" which is a malformed but safe URL
    return `https://${trimmedUrl}`;
  }

  // No protocol and not relative - likely a domain without protocol - prepend https://
  return `https://${trimmedUrl}`;
}
