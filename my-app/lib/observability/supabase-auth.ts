import { noteVerifiedSubject } from './context'

type ProfileClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (
        column: string,
        value: string,
      ) => {
        maybeSingle: () => Promise<{ data: { username?: string | null } | null }>
      }
    }
  }
}

type AuthSurface = {
  getUser: (...args: never[]) => Promise<{ data: { user: { id?: string } | null } | null }>
  getClaims?: (...args: never[]) => Promise<{ data: { claims?: { sub?: string } } | null }>
  __nhObserved?: boolean
}

async function attachUsername(client: ProfileClient, userId: string): Promise<void> {
  try {
    const { data } = await client.from('profiles').select('username').eq('id', userId).maybeSingle()
    noteVerifiedSubject(userId, data?.username)
  } catch {
    // Telemetry must never fail auth. user_ref is already recorded.
  }
}

/** Notes the verified subject whenever this client's auth lookup succeeds. */
export function observeSupabaseAuth<T extends { auth: object }>(client: T): T {
  const auth = client.auth as AuthSurface
  if (auth.__nhObserved) return client
  const profileClient = client as unknown as ProfileClient

  const getUser = auth.getUser.bind(auth)
  auth.getUser = (async (...args: never[]) => {
    const result = await getUser(...args)
    const userId = result?.data?.user?.id
    if (userId) {
      noteVerifiedSubject(userId)
      await attachUsername(profileClient, userId)
    }
    return result
  }) as AuthSurface['getUser']

  if (typeof auth.getClaims === 'function') {
    const getClaims = auth.getClaims.bind(auth)
    auth.getClaims = (async (...args: never[]) => {
      const result = await getClaims(...args)
      const userId = result?.data?.claims?.sub
      if (userId) {
        noteVerifiedSubject(userId)
        await attachUsername(profileClient, userId)
      }
      return result
    }) as AuthSurface['getClaims']
  }

  auth.__nhObserved = true
  return client
}
