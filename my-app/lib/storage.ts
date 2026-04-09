/**
 * Converts a Supabase Storage public URL to a CDN-transformed WebP render URL.
 * Works with existing URLs already stored in profiles.avatar_url — no schema changes needed.
 */
export function getAvatarUrl(avatarUrl: string | null | undefined, size: number = 80): string | null {
  if (!avatarUrl) return null
  // Strip any existing query string (e.g. ?t=cache-bust) before adding transform params
  const withoutQuery = avatarUrl.split('?')[0]
  const base = withoutQuery.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  )
  return `${base}?width=${size}&height=${size}&resize=cover&format=webp&quality=80`
}
