import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateUniqueUsername } from '@/lib/username'
import { NextResponse, after } from 'next/server'
import { notifyNewSignup } from '@/lib/services/signup-notification'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/home'
  if (!next.startsWith('/')) {
    next = '/home'
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Ensure a profile exists for OAuth users on first sign-in
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const admin = createAdminClient()
        const { data: existingProfile } = await admin
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()

        if (!existingProfile) {
          const fullName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'User'
          const username = await generateUniqueUsername(fullName)

          const { error: insertError } = await admin.from('profiles').insert({
            id: user.id,
            email: user.email,
            name: fullName,
            role: 'athlete',
            username,
            updated_at: new Date().toISOString(),
          })

          if (!insertError) {
            const provider: string | undefined = user.app_metadata?.provider
            after(() => notifyNewSignup(admin, {
              name: fullName,
              email: user.email ?? '',
              username,
              role: 'athlete',
              method: provider
                ? `Website (${provider.charAt(0).toUpperCase()}${provider.slice(1)} sign-in)`
                : 'Website (OAuth)',
            }))
          }
        }
      }

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (siteUrl) {
        return NextResponse.redirect(`${siteUrl}${next}`)
      } else {
        const forwardedHost = request.headers.get('x-forwarded-host')
        return NextResponse.redirect(forwardedHost ? `https://${forwardedHost}${next}` : `${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
