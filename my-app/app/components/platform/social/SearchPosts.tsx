'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { PostCard } from '@/app/components/platform/social/PostCard'
import { StatusMessage } from '@/app/components/platform/social/StatusMessage'
import { searchPostsPage, togglePostLike, type EnrichedPost } from '@/lib/social/browser'
import { sans } from '@/lib/social/format'

const DEBOUNCE_MS = 300

export function SearchPosts() {
  const [inputValue, setInputValue] = useState('')
  const [query, setQuery] = useState('')
  const [posts, setPosts] = useState<EnrichedPost[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [likePending, setLikePending] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(inputValue.trim()), DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [inputValue])

  useEffect(() => {
    if (!query) {
      setPosts([])
      setCursor(null)
      setHasNext(false)
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    searchPostsPage(query)
      .then((page) => {
        if (cancelled) return
        setPosts(page.data)
        setCursor(page.nextCursor)
        setHasNext(page.hasNext)
      })
      .catch((searchError) => {
        if (!cancelled) {
          setPosts([])
          setError(searchError instanceof Error ? searchError.message : 'Search failed.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [query])

  async function handleLoadMore() {
    if (!query || !cursor || loadingMore) return
    setLoadingMore(true)
    try {
      const page = await searchPostsPage(query, cursor)
      setPosts((current) => [...current, ...page.data])
      setCursor(page.nextCursor)
      setHasNext(page.hasNext)
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Could not load more results.')
    } finally {
      setLoadingMore(false)
    }
  }

  async function handleLike(post: EnrichedPost) {
    if (likePending[post.id]) return
    const previous = post
    setLikePending((current) => ({ ...current, [post.id]: true }))
    setPosts((current) => current.map((item) => item.id === post.id
      ? { ...item, likedByMe: !item.likedByMe, likeCount: Math.max(0, item.likeCount + (item.likedByMe ? -1 : 1)) }
      : item))
    try {
      const result = await togglePostLike(post.id)
      setPosts((current) => current.map((item) => item.id === post.id
        ? {
            ...item,
            likedByMe: result.liked,
            likeCount: Math.max(0, previous.likeCount + (result.liked === previous.likedByMe ? 0 : result.liked ? 1 : -1)),
          }
        : item))
    } catch (likeError) {
      setPosts((current) => current.map((item) => item.id === post.id ? previous : item))
      setError(likeError instanceof Error ? likeError.message : 'Could not update like.')
    } finally {
      setLikePending((current) => ({ ...current, [post.id]: false }))
    }
  }

  return (
    <div className="min-h-screen bg-[#141115] px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center gap-2">
          <Link href="/home" aria-label="Close search" className="flex h-9 w-9 items-center justify-center text-white">
            <X size={22} />
          </Link>
          <div className="flex h-11 flex-1 items-center gap-2 rounded-lg bg-[#1E1B1F] px-3">
            <Search size={16} className="text-[#6B6870]" />
            <input
              autoFocus
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Search posts…"
              aria-label="Search posts"
              className="w-full bg-transparent text-[14px] text-white outline-none placeholder:text-[#6B6870]"
              style={sans}
            />
            {inputValue ? (
              <button type="button" aria-label="Clear search" onClick={() => setInputValue('')} className="text-[#6B6870]">
                <X size={16} />
              </button>
            ) : null}
          </div>
        </div>

        {!query ? <StatusMessage>Search for posts by keyword</StatusMessage> : null}
        {query && loading ? <StatusMessage>Searching…</StatusMessage> : null}
        {query && !loading && error && posts.length === 0 ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        {query && !loading && !error && posts.length === 0 ? (
          <StatusMessage>No posts found for “{query}”</StatusMessage>
        ) : null}

        {posts.map((post) => (
          <PostCard key={post.id} post={post} likePending={likePending[post.id]} onLike={() => handleLike(post)} />
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
    </div>
  )
}
