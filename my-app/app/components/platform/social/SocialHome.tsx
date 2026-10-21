'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { PostCard } from '@/app/components/platform/social/PostCard'
import { StatusMessage } from '@/app/components/platform/social/StatusMessage'
import { fetchFeedPage, togglePostLike, type EnrichedPost } from '@/lib/social/browser'
import { sans, display } from '@/lib/social/format'

export function SocialHome() {
  const [posts, setPosts] = useState<EnrichedPost[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [likePending, setLikePending] = useState<Record<string, boolean>>({})

  const load = useCallback(async (nextCursor?: string | null) => {
    const page = await fetchFeedPage(nextCursor)
    setPosts((current) => nextCursor ? [...current, ...page.data] : page.data)
    setCursor(page.nextCursor)
    setHasNext(page.hasNext)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    load()
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Could not load the feed.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [load])

  async function handleLike(post: EnrichedPost) {
    if (likePending[post.id]) return
    const previous = post
    setLikePending((current) => ({ ...current, [post.id]: true }))
    setPosts((current) => current.map((item) => item.id === post.id
      ? { ...item, likedByMe: !item.likedByMe, likeCount: item.likeCount + (item.likedByMe ? -1 : 1) }
      : item))
    try {
      const result = await togglePostLike(post.id)
      setPosts((current) => current.map((item) => item.id === post.id
        ? { ...item, likedByMe: result.liked, likeCount: previous.likeCount + (result.liked === previous.likedByMe ? 0 : result.liked ? 1 : -1) }
        : item))
    } catch (likeError) {
      setPosts((current) => current.map((item) => item.id === post.id ? previous : item))
      setError(likeError instanceof Error ? likeError.message : 'Could not update like.')
    } finally {
      setLikePending((current) => ({ ...current, [post.id]: false }))
    }
  }

  async function handleLoadMore() {
    if (!hasNext || !cursor || loadingMore) return
    setLoadingMore(true)
    try {
      await load(cursor)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load more posts.')
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#141115] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white" style={{ ...display, letterSpacing: '-0.02em' }}>
            Home
          </h1>
          <Link href="/home/search" aria-label="Search posts and people" className="text-white">
            <Search size={20} />
          </Link>
        </div>

        {loading && posts.length === 0 ? <StatusMessage>Loading posts…</StatusMessage> : null}
        {!loading && error && posts.length === 0 ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        {!loading && !error && posts.length === 0 ? (
          <StatusMessage>No posts yet. Share a workout, a meal, or a note.</StatusMessage>
        ) : null}

        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            likePending={likePending[post.id]}
            onLike={() => handleLike(post)}
          />
        ))}

        {error && posts.length > 0 ? <StatusMessage tone="error">{error}</StatusMessage> : null}

        {hasNext && (
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="mt-6 w-full border border-[#3A373C] py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A09EA3] disabled:opacity-50"
            style={sans}
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        )}
      </div>

      <Link
        href="/home/new"
        aria-label="New post"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5] text-[#141115] shadow-lg md:bottom-8 md:right-8"
      >
        <Plus size={28} />
      </Link>
    </div>
  )
}
