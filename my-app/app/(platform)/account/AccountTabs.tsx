'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { WorkoutCard, type WorkoutCardLog } from '@/app/components/platform/WorkoutCard'
import { MealCard } from '@/app/components/platform/meals/MealCard'
import { PostCard } from '@/app/components/platform/social/PostCard'
import { StatusMessage } from '@/app/components/platform/social/StatusMessage'
import { LogoSpinner } from '@/app/components/ui/logo-spinner'
import { fetchRecentMeals } from '@/lib/meals/browser'
import { fetchUserPosts, togglePostLike, type EnrichedPost } from '@/lib/social/browser'
import type { MealListItem } from '@/lib/meals/types'
import { sans } from '@/lib/social/format'

// ─────────────────────────────────────────────
// ACCOUNT TABS (client)
//   Workouts · Meals · Posts — mirrors the mobile account screen.
//   Workouts arrive from the server; Meals and Posts lazy-load on first view.
// ─────────────────────────────────────────────

type TabKey = 'workouts' | 'meals' | 'posts'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'workouts', label: 'Workouts' },
  { key: 'meals', label: 'Meals' },
  { key: 'posts', label: 'Posts' },
]

type AsyncState<T> = {
  data: T
  loaded: boolean
  loading: boolean
  error: string | null
}

const emptyState = <T,>(initial: T): AsyncState<T> => ({ data: initial, loaded: false, loading: false, error: null })

function TabSpinner() {
  return (
    <div className="mx-5 my-3 flex items-center gap-2">
      <LogoSpinner size={20} />
      <span className="text-[14px] text-[#847E89]" style={sans}>Loading…</span>
    </div>
  )
}

function EmptyCTA({ message, href, cta }: { message: string; href: string; cta: string }) {
  return (
    <p className="px-5 pb-4 pt-1 text-[14px] text-[#847E89]" style={sans}>
      {message}{' '}
      <Link href={href} className="text-[#F5F5F5] hover:underline">
        {cta} →
      </Link>
    </p>
  )
}

export default function AccountTabs({ userId, workouts }: { userId: string; workouts: WorkoutCardLog[] }) {
  const [activeTab, setActiveTab] = useState<TabKey>('workouts')
  const [meals, setMeals] = useState<AsyncState<MealListItem[]>>(() => emptyState<MealListItem[]>([]))
  const [posts, setPosts] = useState<AsyncState<EnrichedPost[]>>(() => emptyState<EnrichedPost[]>([]))
  const [postsCursor, setPostsCursor] = useState<string | null>(null)
  const [postsHasNext, setPostsHasNext] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  // Lazy-load a tab's data the first time it is opened.
  useEffect(() => {
    if (activeTab === 'meals' && !meals.loaded && !meals.loading) {
      setMeals((s) => ({ ...s, loading: true }))
      fetchRecentMeals(userId)
        .then((rows) => setMeals({ data: rows, loaded: true, loading: false, error: null }))
        .catch((e: unknown) =>
          setMeals({ data: [], loaded: true, loading: false, error: e instanceof Error ? e.message : 'Could not load your meals.' }),
        )
    }
    if (activeTab === 'posts' && !posts.loaded && !posts.loading) {
      setPosts((s) => ({ ...s, loading: true }))
      fetchUserPosts(userId)
        .then((page) => {
          setPosts({ data: page.data, loaded: true, loading: false, error: null })
          setPostsCursor(page.nextCursor)
          setPostsHasNext(page.hasNext)
        })
        .catch((e: unknown) =>
          setPosts({ data: [], loaded: true, loading: false, error: e instanceof Error ? e.message : 'Could not load your posts.' }),
        )
    }
  }, [activeTab, userId, meals.loaded, meals.loading, posts.loaded, posts.loading])

  async function handleLike(post: EnrichedPost) {
    const previous = post
    setPosts((s) => ({
      ...s,
      data: s.data.map((p) =>
        p.id === post.id ? { ...p, likedByMe: !p.likedByMe, likeCount: Math.max(0, p.likeCount + (p.likedByMe ? -1 : 1)) } : p,
      ),
    }))
    try {
      const result = await togglePostLike(post.id)
      setPosts((s) => ({
        ...s,
        data: s.data.map((p) =>
          p.id === post.id
            ? { ...p, likedByMe: result.liked, likeCount: Math.max(0, previous.likeCount + (result.liked === previous.likedByMe ? 0 : result.liked ? 1 : -1)) }
            : p,
        ),
      }))
    } catch {
      setPosts((s) => ({ ...s, data: s.data.map((p) => (p.id === post.id ? previous : p)) }))
    }
  }

  async function loadMorePosts() {
    if (!postsCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const page = await fetchUserPosts(userId, postsCursor)
      setPosts((s) => ({ ...s, data: [...s.data, ...page.data] }))
      setPostsCursor(page.nextCursor)
      setPostsHasNext(page.hasNext)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div>
      {/* ── Tab switcher ── */}
      <div className="flex flex-wrap gap-2 px-4 py-4">
        {TABS.map((tab) => {
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full border border-white px-5 py-2 text-[14px] font-semibold transition-opacity ${
                active ? 'bg-white text-black' : 'bg-transparent text-white hover:opacity-75'
              }`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Workouts ── */}
      {activeTab === 'workouts' &&
        (workouts.length === 0 ? (
          <EmptyCTA message="No workouts logged yet." href="/record" cta="Log your first workout" />
        ) : (
          <div className="flex flex-col gap-4 px-4">
            {workouts.map((log) => (
              <WorkoutCard key={log.id} log={log} variant="account" showEdit />
            ))}
          </div>
        ))}

      {/* ── Meals ── */}
      {activeTab === 'meals' &&
        (meals.loading ? (
          <TabSpinner />
        ) : meals.error ? (
          <div className="px-4"><StatusMessage tone="error">{meals.error}</StatusMessage></div>
        ) : meals.data.length === 0 ? (
          <EmptyCTA message="No meals logged yet." href="/meals" cta="Log a meal" />
        ) : (
          <ul className="space-y-4 px-4">
            {meals.data.map((meal) => (
              <li key={meal.meal_id}>
                <MealCard meal={meal} />
              </li>
            ))}
          </ul>
        ))}

      {/* ── Posts ── */}
      {activeTab === 'posts' &&
        (posts.loading ? (
          <TabSpinner />
        ) : posts.error ? (
          <div className="px-4"><StatusMessage tone="error">{posts.error}</StatusMessage></div>
        ) : posts.data.length === 0 ? (
          <EmptyCTA message="No posts yet." href="/home/new" cta="Share something" />
        ) : (
          <div className="px-2">
            {posts.data.map((post) => (
              <PostCard key={post.id} post={post} onLike={() => handleLike(post)} />
            ))}
            {postsHasNext && postsCursor ? (
              <button
                type="button"
                onClick={loadMorePosts}
                disabled={loadingMore}
                className="mt-4 w-full rounded-full border border-[#3A373C] py-3 text-[11px] uppercase tracking-[0.16em] text-[#A09EA3] transition-colors hover:border-[#F5F5F5]/40 hover:text-white disabled:opacity-40"
                style={sans}
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            ) : null}
          </div>
        ))}
    </div>
  )
}
