import { noteVerifiedSubject } from './context'

type AuthSurface = {
  getUser: (...args: never[]) => Promise<{ data: { user: { id?: string } | null } | null }>
  getClaims?: (...args: never[]) => Promise<{ data: { claims?: { sub?: string } } | null }>
  __nhObserved?: boolean
}

/** Notes the verified subject whenever this client's auth lookup succeeds. */
export function observeSupabaseAuth<T extends { auth: object }>(client: T): T {
  const auth = client.auth as AuthSurface
  if (auth.__nhObserved) return client

  const getUser = auth.getUser.bind(auth)
  auth.getUser = (async (...args: never[]) => {
    const result = await getUser(...args)
    noteVerifiedSubject(result?.data?.user?.id)
    return result
  }) as AuthSurface['getUser']

  if (typeof auth.getClaims === 'function') {
    const getClaims = auth.getClaims.bind(auth)
    auth.getClaims = (async (...args: never[]) => {
      const result = await getClaims(...args)
      noteVerifiedSubject(result?.data?.claims?.sub)
      return result
    }) as AuthSurface['getClaims']
  }

  auth.__nhObserved = true
  return client
}
