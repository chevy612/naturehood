export const USER_SEARCH_LIMIT = 20

/**
 * Builds a case-insensitive "contains" LIKE pattern for a username search.
 * A leading "@" is ignored and LIKE wildcards typed by the user are escaped so
 * "_" and "%" match literally. Returns null when nothing searchable remains.
 */
export function usernameSearchPattern(query: string): string | null {
  const term = query.trim().replace(/^@+/, '').trim()
  if (!term) return null
  return `%${term.replace(/[%_\\]/g, '\\$&')}%`
}
