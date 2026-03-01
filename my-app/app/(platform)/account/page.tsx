import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PillTag } from '@/app/components/ui/tags'
import DashboardEditForm from './DashboardEditForm'
import { signOut } from './actions'

// ─────────────────────────────────────────────
// AVATAR — initials fallback, lime ring
// Pattern from ProfileCard component
// ─────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="relative w-24 h-24 rounded-full overflow-hidden shrink-0 flex items-center justify-center ring-2 ring-[#C8F04D] bg-[#C8F04D]">
      <span
        className="text-xl font-bold select-none text-[#141115]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {initials}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────
// ROLE LABEL
// ─────────────────────────────────────────────

function roleLabel(role: string | null): string {
  if (role === 'brand') return 'Brand'
  if (role === 'other') return 'Explorer'
  return 'Athlete'
}

// ─────────────────────────────────────────────
// DASHBOARD PAGE
// ─────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, username, bio, role')
    .eq('id', user.id)
    .single()

  const name = profile?.name ?? user.email?.split('@')[0] ?? 'Member'
  const username = profile?.username ?? ''
  const bio = profile?.bio ?? ''
  const role = profile?.role ?? null

  return (
    <div className="min-h-screen bg-[#141115] px-6 py-10">
      <div className="max-w-2xl mx-auto">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-10">
          <p
            className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Dashboard
          </p>
          <form action={signOut}>
            <button
              type="submit"
              className="text-[12px] font-medium text-[#6B6870] hover:text-white transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Sign out
            </button>
          </form>
        </div>

        {/* ── Two-column layout ── */}
        <div className="flex flex-col md:flex-row gap-10">

          {/* ── Left: Profile summary ── */}
          <div className="flex flex-col items-center md:items-start gap-4 md:w-56 shrink-0">
            <Avatar name={name} />

            <div className="text-center md:text-left">
              <h1
                className="text-xl font-bold text-white leading-tight mb-1"
                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}
              >
                {name}
              </h1>
              {username && (
                <p
                  className="text-sm text-[#6B6870] mb-2"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  @{username}
                </p>
              )}
              <PillTag label={roleLabel(role)} size="sm" variant="ghost-green" />
            </div>

            {username && (
              <Link
                href={`/${username}`}
                className="text-[12px] font-medium text-[#C8F04D] hover:text-white transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                View public profile →
              </Link>
            )}
          </div>

          {/* ── Right: Edit form ── */}
          <div className="flex-1">
            <h2
              className="text-[13px] font-semibold text-white mb-6"
              style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em' }}
            >
              Edit Profile
            </h2>
            <DashboardEditForm initialName={name} initialUsername={username} initialBio={bio} />
          </div>

        </div>
      </div>
    </div>
  )
}
