import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FeedCard } from '@/app/components/platform/FeedCard'

const PAGE_SIZE = 20

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const supabase = await createClient()

  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // Step 1: fetch public training logs
  const { data: logs } = await supabase
    .from('training_logs')
    .select('id, title, logged_date, duration_minutes, workout_types, workout_log, user_id')
    .eq('is_public', true)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .range(from, to)

  const logList = logs ?? []

  // Step 2: fetch profiles for those users (two-step because the FK goes through
  // auth.users, so PostgREST can't auto-join training_logs → profiles)
  const userIds = [...new Set(logList.map((l) => l.user_id))]
  const { data: profilesData } = userIds.length > 0
    ? await supabase
        .from('profiles')
        .select('id, name, username, avatar_url')
        .in('id', userIds)
    : { data: [] }

  const profileMap = Object.fromEntries(
    (profilesData ?? []).map((p) => [p.id, { name: p.name, username: p.username, avatar_url: p.avatar_url }])
  )

  // Merge profiles into logs
  const feed = logList.map((log) => ({
    ...log,
    profiles: profileMap[log.user_id] ?? null,
  }))
  const hasMore = feed.length === PAGE_SIZE

  return (
    <div className="min-h-screen bg-[#141115] px-4 py-10">
      <div className="max-w-2xl mx-auto">

        <p
          className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D] mb-10"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Community Feed
        </p>

        {feed.length === 0 ? (
          <p
            className="text-[14px] text-[#6B6870] py-16 text-center"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            No workouts logged yet. Be the first to record one.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {feed.map((log) => (
              <FeedCard key={log.id} log={log} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {(page > 1 || hasMore) && (
          <div
            className="flex justify-between mt-10 text-[12px] font-semibold tracking-wider uppercase text-[#6B6870]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {page > 1 ? (
              <Link href={`/home?page=${page - 1}`} className="hover:text-white transition-colors">
                ← Newer
              </Link>
            ) : <span />}
            {hasMore && (
              <Link href={`/home?page=${page + 1}`} className="hover:text-white transition-colors">
                Older →
              </Link>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
