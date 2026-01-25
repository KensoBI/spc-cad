/**
 * Ensures a URL has a protocol prefix (http:// or https://) when appropriate.
 * - Leaves URLs with protocols unchanged (http://, https://, ftp://, etc.)
 * - Leaves relative URLs unchanged (/, ./, ../, #)
 * - Adds https:// to domain-like strings (www.example.com, example.com)
 *
 * This prevents URLs like "www.example.com" from being treated as relative paths
 * while preserving intentional relative URLs.
 *
 * @param url - The URL to sanitize
 * @returns The URL with a protocol prefix if needed
 */
export function ensureUrlProtocol(url: string): string {
  if (!url || url.trim().length === 0) {
    return url;
  }

  const trimmedUrl = url.trim();

  // Check if URL already has a protocol (http://, https://, ftp://, mailto:, etc.)
  const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/i.test(trimmedUrl);
  if (hasProtocol) {
    return trimmedUrl;
  }

  // Check if it's a relative URL (starts with /, ./, ../, or #)
  const isRelative = /^(\/|\.\/|\.\.\/|#)/i.test(trimmedUrl);
  if (isRelative) {
    return trimmedUrl;
  }

  // Otherwise, it's likely a domain without protocol - prepend https://
  return `https://${trimmedUrl}`;
}
