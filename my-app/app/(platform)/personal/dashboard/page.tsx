import { createClient } from '@/lib/supabase/server'
import { PersonalDashboard } from '@/app/components/platform/dashboard/PersonalDashboard'
import type { DashboardWorkout } from '@/lib/dashboard/utils'
import type { PerceivedIntensity, SessionType } from '@/lib/types'

export const metadata = { title: 'Dashboard | Naturehood' }

// How far back the calendar can navigate.
const HISTORY_MONTHS = 12

// ─────────────────────────────────────────────
// PERSONAL DASHBOARD PAGE
//   Training calendar + body check for the signed-in athlete.
// ─────────────────────────────────────────────

export default async function PersonalDashboardPage() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub as string

  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth() - (HISTORY_MONTHS - 1), 1)
  const minMonth = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, '0')}`

  const { data: logs } = await supabase
    .from('training_logs')
    .select('id, title, logged_date, duration_minutes')
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .gte('logged_date', `${minMonth}-01`)
    .order('logged_date', { ascending: false })

  const logIds = (logs ?? []).map((log) => log.id)
  const { data: details } = logIds.length
    ? await supabase
        .from('session_details')
        .select('training_log_id, session_type, perceived_intensity, readiness_feel, readiness_pain_score')
        .in('training_log_id', logIds)
    : { data: [] }

  const detailsByLog = new Map((details ?? []).map((d) => [d.training_log_id as string, d]))
  const workouts: DashboardWorkout[] = (logs ?? []).map((log) => {
    const d = detailsByLog.get(log.id)
    return {
      id: log.id,
      title: log.title,
      logged_date: log.logged_date,
      duration_minutes: log.duration_minutes,
      session_type: (d?.session_type as SessionType | null) ?? null,
      perceived_intensity: (d?.perceived_intensity as PerceivedIntensity | null) ?? null,
      readiness_feel: d?.readiness_feel ?? null,
      readiness_pain_score: d?.readiness_pain_score ?? null,
    }
  })

  return (
    <div className="min-h-screen bg-[#141115] px-4 pb-10 pt-6 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <h1
          className="mb-6 text-2xl font-normal leading-none text-white"
          style={{ fontFamily: "'Sk Modernist', sans-serif", letterSpacing: '-0.01em' }}
        >
          Dashboard
        </h1>

        <PersonalDashboard userId={userId} workouts={workouts} minMonth={minMonth} />
      </div>
    </div>
  )
}
