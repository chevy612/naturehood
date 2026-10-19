import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import type { WorkoutCardLog } from '@/app/components/platform/WorkoutCard'
import AccountProfile from './AccountProfile'
import AccountTabs from './AccountTabs'
import { signOut } from './actions'

// ─────────────────────────────────────────────
// ACCOUNT PAGE
// ─────────────────────────────────────────────

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub as string

  const [{ data: profile }, { data: trainingLogs }] = await Promise.all([
    supabase
      .from('profiles')
      .select('name, username, bio, role, avatar_url, email')
      .eq('id', userId)
      .single(),
    supabase
      .from('training_logs')
      .select('id, title, logged_date, duration_minutes, workout_types, workout_log, is_public, ai_structured, ai_formatted_at')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('logged_date', { ascending: false })
      .limit(60),
  ])

  const name = profile?.name ?? profile?.email?.split('@')[0] ?? 'Member'
  const username = profile?.username ?? ''
  const bio = profile?.bio ?? ''
  const role = profile?.role ?? null
  const avatarUrl = profile?.avatar_url ?? null
  const logs = (trainingLogs ?? []) as WorkoutCardLog[]

  return (
    <div className="min-h-screen bg-[#141115] px-6 py-10">
      <div className="mx-auto max-w-2xl">

        {/* ── Top bar ── */}
        <div className="mb-8 flex items-center justify-between">
          <h1
            className="text-[22px] font-bold text-white"
            style={{ fontFamily: "'Sk Modernist', sans-serif", letterSpacing: '-0.02em' }}
          >
            Account
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/home/notifications"
              aria-label="Notifications"
              className="text-[#A09EA3] transition-colors hover:text-white"
            >
              <Bell size={20} />
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="text-[12px] font-medium text-[#6B6870] transition-colors hover:text-white"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* ── Profile header (client — handles edit toggle + share) ── */}
        <AccountProfile
          name={name}
          username={username}
          bio={bio}
          role={role}
          avatarUrl={avatarUrl}
          workoutCount={logs.length}
        />

        {/* ── Section divider ── */}
        <div className="mb-6 h-px bg-[#3A373C]" />

        {/* ── Tabbed content: Workouts · Meals · Posts ── */}
        <AccountTabs userId={userId} workouts={logs} />

      </div>
    </div>
  )
}
