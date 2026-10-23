import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import type { WorkoutCardLog } from '@/app/components/platform/WorkoutCard'
import AccountProfile from './AccountProfile'
import AccountTabs from './AccountTabs'

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
      .select('name, username, bio, avatar_url, email, gender, ethnicity, weight_kg, height_cm')
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
  const avatarUrl = profile?.avatar_url ?? null
  const gender = profile?.gender ?? null
  const ethnicity = profile?.ethnicity ?? null
  const weightKg = profile?.weight_kg != null ? Number(profile.weight_kg) : null
  const heightCm = profile?.height_cm != null ? Number(profile.height_cm) : null
  const logs = (trainingLogs ?? []) as WorkoutCardLog[]

  return (
    <div className="min-h-screen bg-[#141115] pb-10 pt-4">
      <div className="mx-auto max-w-2xl">

        {/* ── Top bar (mirrors mobile AccountHeader) ── */}
        <div className="flex items-center justify-between px-5 pt-2">
          <h1
            className="text-[20px] font-bold text-white"
            style={{ fontFamily: "'Sk Modernist', sans-serif", letterSpacing: '-0.02em' }}
          >
            Account
          </h1>
          <Link
            href="/home/notifications"
            aria-label="Notifications"
            className="p-1 text-white transition-opacity hover:opacity-75"
          >
            <Bell size={22} />
          </Link>
        </div>

        {/* ── Profile header (client — handles edit modal + share) ── */}
        <AccountProfile
          name={name}
          username={username}
          bio={bio}
          avatarUrl={avatarUrl}
          gender={gender}
          ethnicity={ethnicity}
          weightKg={weightKg}
          heightCm={heightCm}
        />

        {/* ── Separator ── */}
        <div className="h-px bg-[#3D3940]" />

        {/* ── Tabbed content: Workouts · Meals · Posts ── */}
        <AccountTabs userId={userId} workouts={logs} />

      </div>
    </div>
  )
}
