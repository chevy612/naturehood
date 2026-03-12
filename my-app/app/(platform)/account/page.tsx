import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PillTag } from '@/app/components/ui/tags'
import { Avatar } from '@/app/components/platform/Avatar'
import DashboardEditForm from './DashboardEditForm'
import { signOut } from './actions'

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

  const [{ data: profile }, { data: trainingLogs }] = await Promise.all([
    supabase
      .from('profiles')
      .select('name, username, bio, role, avatar_url')
      .eq('id', user.id)
      .single(),
    supabase
      .from('training_logs')
      .select('id, title, logged_date, duration_minutes, workout_types, workout_log, is_public')
      .eq('user_id', user.id)
      .order('logged_date', { ascending: false })
      .limit(20),
  ])

  const name = profile?.name ?? user.email?.split('@')[0] ?? 'Member'
  const username = profile?.username ?? ''
  const bio = profile?.bio ?? ''
  const role = profile?.role ?? null
  const avatarUrl = profile?.avatar_url ?? null
  const logs = trainingLogs ?? []

  return (
    <div className="min-h-screen bg-[#141115] px-6 py-10">
      <div className="max-w-2xl mx-auto">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-10">
          <p
            className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Account
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
            <Avatar name={name} size="lg" photoUrl={avatarUrl} />

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

          {/* ── Right: Edit form + training history ── */}
          <div className="flex-1 space-y-12">

            {/* Edit Profile */}
            <div>
              <h2
                className="text-[13px] font-semibold text-white mb-6"
                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em' }}
              >
                Edit Profile
              </h2>
              <DashboardEditForm initialName={name} initialUsername={username} initialBio={bio} initialAvatarUrl={avatarUrl} />
            </div>

            {/* My Training */}
            <div>
              <h2
                className="text-[13px] font-semibold text-white mb-4"
                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em' }}
              >
                My Training
              </h2>

              {logs.length === 0 ? (
                <p
                  className="text-[13px] text-[#6B6870]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  No workouts logged yet.{' '}
                  <Link href="/record" className="text-[#C8F04D] hover:underline">
                    Log your first workout →
                  </Link>
                </p>
              ) : (
                <div className="flex flex-col divide-y divide-[#3A373C]">
                  {logs.map((log) => (
                    <div key={log.id} className="py-4">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <p
                          className="text-[14px] font-semibold text-white leading-snug"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          {log.title}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          {!log.is_public && (
                            <PillTag label="Private" variant="ghost-dark" size="sm" />
                          )}
                          {log.duration_minutes && (
                            <PillTag label={`${log.duration_minutes} min`} variant="ghost-green" size="sm" />
                          )}
                          <Link
                            href={`/record/${log.id}/edit`}
                            className="text-[11px] font-medium text-[#6B6870] hover:text-[#C8F04D] transition-colors"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                      <p
                        className="text-[12px] text-[#6B6870] mb-2"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {new Date(log.logged_date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                      {log.workout_types && log.workout_types.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {log.workout_types.map((type: string) => (
                            <PillTag key={type} label={type} variant="ghost-green" size="sm" />
                          ))}
                        </div>
                      )}
                      {log.workout_log && (
                        <p
                          className="text-[12px] text-[#6B6870] leading-relaxed whitespace-pre-line"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {log.workout_log.length > 200
                            ? log.workout_log.slice(0, 200).trimEnd() + '…'
                            : log.workout_log}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
