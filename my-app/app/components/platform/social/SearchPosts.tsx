'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { PostCard } from '@/app/components/platform/social/PostCard'
import { StatusMessage } from '@/app/components/platform/social/StatusMessage'
import { UserSearchResults } from '@/app/components/platform/social/UserSearchResults'
import {
  searchPostsPage,
  searchUsers,
  togglePostLike,
  type EnrichedPost,
  type UserSearchResult,
} from '@/lib/social/browser'
import { sans, display } from '@/lib/social/format'

const DEBOUNCE_MS = 300

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A09EA3]" style={display}>
      {children}
    </h2>
  )
}

export function SearchPosts() {
  const [inputValue, setInputValue] = useState('')
  const [query, setQuery] = useState('')
  const [posts, setPosts] = useState<EnrichedPost[]>([])
  const [users, setUsers] = useState<UserSearchResult[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [likePending, setLikePending] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(inputValue.trim()), DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [inputValue])

  useEffect(() => {
    if (!query) {
      setPosts([])
      setUsers([])
      setCursor(null)
      setHasNext(false)
      setError(null)
      setUsersError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setUsersError(null)
    Promise.allSettled([searchPostsPage(query), searchUsers(query)])
      .then(([postsResult, usersResult]) => {
        if (cancelled) return
        if (postsResult.status === 'fulfilled') {
          setPosts(postsResult.value.data)
          setCursor(postsResult.value.nextCursor)
          setHasNext(postsResult.value.hasNext)
        } else {
          setPosts([])
          setCursor(null)
          setHasNext(false)
          setError(postsResult.reason instanceof Error ? postsResult.reason.message : 'Search failed.')
        }
        if (usersResult.status === 'fulfilled') {
          setUsers(usersResult.value)
        } else {
          setUsers([])
          setUsersError(usersResult.reason instanceof Error ? usersResult.reason.message : 'Could not search people.')
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

  const hasResults = users.length > 0 || posts.length > 0
  const searching = Boolean(query) && loading && !hasResults
  const failed = Boolean(query) && !loading && !hasResults && (error || usersError)
  const empty = Boolean(query) && !loading && !hasResults && !error && !usersError

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
              placeholder="Search posts and people…"
              aria-label="Search posts and people"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
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

        {!query ? (
          <div className="flex flex-col items-center pt-10">
            <Search size={40} className="text-[#3A373C]" />
            <StatusMessage>Search posts, or people by username</StatusMessage>
          </div>
        ) : null}
        {searching ? <StatusMessage>Searching…</StatusMessage> : null}
        {failed ? <StatusMessage tone="error">{error ?? usersError}</StatusMessage> : null}
        {empty ? <StatusMessage>No results for “{query}”</StatusMessage> : null}

        {users.length > 0 ? (
          <section>
            <SectionLabel>People</SectionLabel>
            <UserSearchResults users={users} />
          </section>
        ) : null}

        {hasResults ? (
          <section>
            {users.length > 0 ? <SectionLabel>Posts</SectionLabel> : null}
            {posts.length === 0 && !loading ? (
              <StatusMessage>No posts found for “{query}”</StatusMessage>
            ) : null}
            {posts.map((post) => (
              <PostCard key={post.id} post={post} likePending={likePending[post.id]} onLike={() => handleLike(post)} />
            ))}
          </section>
        ) : null}

        {hasResults && usersError ? <StatusMessage tone="error">{usersError}</StatusMessage> : null}
        {hasResults && error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
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
