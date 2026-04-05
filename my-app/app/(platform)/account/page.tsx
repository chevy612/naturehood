import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { WorkoutCard } from '@/app/components/platform/WorkoutCard'
import AccountProfile from './AccountProfile'
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
  const logs = trainingLogs ?? []

  return (
    <div className="min-h-screen bg-[#141115] px-6 py-10">
      <div className="max-w-2xl mx-auto">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-8">
          <p
            className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            My Account
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

        {/* ── Profile header (client — handles edit toggle) ── */}
        <AccountProfile
          name={name}
          username={username}
          bio={bio}
          role={role}
          avatarUrl={avatarUrl}
          workoutCount={logs.length}
        />

        {/* ── Section divider ── */}
        <div className="flex items-center gap-4 mb-5">
          <p
            className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#6B6870]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            My Training
          </p>
          <div className="flex-1 h-px bg-[#3A373C]" />
        </div>

        {/* ── Log action buttons ── */}
        <div className="flex gap-3 mb-6">
          <Link
            href="/record"
            className="flex-1 py-3 border border-[#3A373C] text-center text-white text-[12px] font-semibold uppercase tracking-widest hover:border-[#C8F04D]/40 hover:text-[#C8F04D] transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            + Log Workout
          </Link>
          <Link
            href="/record"
            className="flex-1 py-3 bg-[#C8F04D] text-center text-[#141115] text-[12px] font-bold uppercase tracking-widest hover:bg-white transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            + Log with AI
          </Link>
        </div>

        {/* ── Workout grid ── */}
        {logs.length === 0 ? (
          <p
            className="text-[13px] text-[#6B6870] py-8 text-center"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            No workouts logged yet.{' '}
            <Link href="/record" className="text-[#C8F04D] hover:underline">
              Log your first workout →
            </Link>
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {logs.map((log) => (
              <WorkoutCard key={log.id} log={log} variant="grid" />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}