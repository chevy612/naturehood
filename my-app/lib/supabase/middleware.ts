import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const THIRTY_DAYS = 60 * 60 * 24 * 30

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          // Persist session for 30 days so users don't get logged out on browser close
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              maxAge: options.maxAge ?? THIRTY_DAYS,
            })
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  const { pathname } = request.nextUrl

  // app.naturehoodofficial.com — route to the platform regardless of path
  const host = request.headers.get('host') ?? ''
  if (host.startsWith('app.')) {
    const target = pathname === '/home' || pathname === '/login' ? null : (user ? '/home' : '/login')
    if (target) {
      const url = request.nextUrl.clone()
      url.pathname = target
      return NextResponse.redirect(url)
    }
  }

  // Redirect already-authenticated users away from auth pages
  const AUTH_PATHS = ['/login', '/signup']
  if (user && AUTH_PATHS.some(p => pathname.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  // Only redirect unauthenticated users away from protected platform routes.
  // Public routes (/, /signup, /business, /login, /auth/*) remain open.
  const PROTECTED_PATHS = ['/dashboard', '/profile', '/settings', '/home', '/record', '/events', '/account']
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p))

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
