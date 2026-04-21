/**
 * Validates and sanitizes a URL string.
 * Returns the sanitized URL if valid, or empty string if invalid/unsafe.
 */
export function sanitizeUrl(url: string | undefined): string {
  if (!url || typeof url !== 'string') return ''

  const trimmed = url.trim()
  if (!trimmed) return ''

  // Skip validation for values that clearly aren't URLs
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return ''
  }

  try {
    const parsed = new URL(trimmed)

    // Only allow safe protocols
    const allowedProtocols = ['https:', 'http:']
    if (!allowedProtocols.includes(parsed.protocol)) {
      console.warn(`Blocked unsafe protocol: ${parsed.protocol} in URL: ${trimmed}`)
      return ''
    }

    // Block URLs with embedded credentials (user:pass@host)
    if (parsed.username || parsed.password) {
      console.warn(`Blocked URL with embedded credentials: ${trimmed}`)
      return ''
    }

    // Block URLs containing tokens or secrets in query params
    const sensitiveParams = ['token', 'key', 'secret', 'api_key', 'apikey', 'access_token', 'auth']
    for (const param of sensitiveParams) {
      if (parsed.searchParams.has(param)) {
        console.warn(`Blocked URL with sensitive param "${param}": ${trimmed}`)
        return ''
      }
    }

    // Block localhost/internal IPs in production
    const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '192.168.', '10.', '172.16.']
    if (blockedHosts.some(h => parsed.hostname.startsWith(h))) {
      console.warn(`Blocked internal URL: ${trimmed}`)
      return ''
    }

    return parsed.href
  } catch {
    console.warn(`Invalid URL: ${trimmed}`)
    return ''
  }
}

/**
 * Check if a URL is safe for rendering as a link.
 */
export function isSafeUrl(url: string | undefined): boolean {
  return sanitizeUrl(url) !== ''
}
