const PUBLIC_FALLBACK = 'https://naturehoodofficial.com'

/**
 * Hosts a phone can open. `localhost`, raw IPs, `.local`, and non-https
 * origins resolve on the machine that created the link and fail in mobile
 * Safari with "the server can't be found". The `app.` host is excluded
 * because that subdomain used to swallow `/share` before the landing page.
 */
export function isPublicShareOrigin(origin: string | null | undefined): boolean {
  if (!origin) return false
  try {
    const url = new URL(origin)
    const host = url.hostname.toLowerCase()
    if (url.protocol !== 'https:') return false
    if (!host.includes('.')) return false
    if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) return false
    if (host.startsWith('app.')) return false
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return false
    if (host.includes(':')) return false
    return true
  } catch {
    return false
  }
}

export function canonicalShareOrigin(configured?: string | null): string {
  const candidate = (configured ?? process.env.NEXT_PUBLIC_SITE_URL ?? PUBLIC_FALLBACK).replace(/\/$/, '')
  return isPublicShareOrigin(candidate) ? candidate : PUBLIC_FALLBACK
}

export function resolveShareOrigin(currentOrigin: string | null | undefined, configured?: string | null): string {
  if (isPublicShareOrigin(currentOrigin)) return new URL(currentOrigin as string).origin
  return canonicalShareOrigin(configured)
}

export function buildShareUrl(token: string, currentOrigin?: string | null, configured?: string | null): string {
  const origin = resolveShareOrigin(
    currentOrigin === undefined && typeof window !== 'undefined' ? window.location.origin : currentOrigin,
    configured,
  )
  return `${origin}/share/${token}`
}
