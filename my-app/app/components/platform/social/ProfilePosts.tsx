'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Avatar } from '@/app/components/platform/Avatar'
import { PostCard } from '@/app/components/platform/social/PostCard'
import { StatusMessage } from '@/app/components/platform/social/StatusMessage'
import { PillTag } from '@/app/components/ui/tags'
import {
  fetchCurrentProfile,
  fetchFollowCounts,
  fetchFollowStatus,
  fetchProfileDetail,
  fetchUserPosts,
  setFollowing,
  togglePostLike,
  type EnrichedPost,
  type ProfileDetail,
} from '@/lib/social/browser'
import { displayName, roleLabel, sans } from '@/lib/social/format'

export function ProfilePosts({
  userId,
  initialProfile,
}: {
  userId: string
  initialProfile?: ProfileDetail | null
}) {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileDetail | null>(initialProfile ?? null)
  const [posts, setPosts] = useState<EnrichedPost[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState(false)
  const [viewerId, setViewerId] = useState<string | null>(null)
  const [following, setFollowingState] = useState(false)
  const [counts, setCounts] = useState({ followerCount: 0, followingCount: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [followError, setFollowError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      initialProfile !== undefined ? Promise.resolve(initialProfile) : fetchProfileDetail(userId),
      fetchUserPosts(userId),
      fetchFollowCounts(userId),
      fetchFollowStatus(userId),
      fetchCurrentProfile(),
    ]).then(([loadedProfile, page, nextCounts, status, current]) => {
      if (cancelled) return
      setProfile(loadedProfile)
      setPosts(page.data)
      setCursor(page.nextCursor)
      setHasNext(page.hasNext)
      setCounts(nextCounts)
      setFollowingState(status.following)
      setViewerId(current?.userId ?? null)
    }).catch((loadError) => {
      if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Could not load this profile.')
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [userId, initialProfile])

  async function handleFollow() {
    if (busy) return
    setBusy(true)
    setFollowError(null)
    const next = !following
    try {
      const result = await setFollowing(userId, next)
      setFollowingState(result.following)
      setCounts((current) => ({
        ...current,
        followerCount: Math.max(0, current.followerCount + (result.following === following ? 0 : result.following ? 1 : -1)),
      }))
    } catch (followFailure) {
      setFollowError(followFailure instanceof Error ? followFailure.message : 'Could not update follow.')
    } finally {
      setBusy(false)
    }
  }

  async function handleLike(post: EnrichedPost) {
    const previous = post
    setPosts((current) => current.map((item) => item.id === post.id
      ? { ...item, likedByMe: !item.likedByMe, likeCount: Math.max(0, item.likeCount + (item.likedByMe ? -1 : 1)) }
      : item))
    try {
      const result = await togglePostLike(post.id)
      setPosts((current) => current.map((item) => item.id === post.id
        ? { ...item, likedByMe: result.liked, likeCount: Math.max(0, previous.likeCount + (result.liked === previous.likedByMe ? 0 : result.liked ? 1 : -1)) }
        : item))
    } catch {
      setPosts((current) => current.map((item) => item.id === post.id ? previous : item))
    }
  }

  function handleBack() {
    if (window.history.length > 1) router.back()
    else router.push('/home')
  }

  const name = displayName(profile, userId)
  const bio = profile?.bio?.trim()

  return (
    <div className="min-h-screen bg-[#141115] px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <button type="button" onClick={handleBack} className="mb-4 inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.16em] text-[#A09EA3]" style={sans}>
          <ChevronLeft size={16} />
          Back
        </button>
        {loading ? <StatusMessage>Loading profile…</StatusMessage> : null}
        {!loading && error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        {!loading && !error && (
          <>
            <div className="mb-6 flex items-center gap-4">
              <Avatar name={name} photoUrl={profile?.avatar_url} size="lg" />
              <div>
                <p className="text-[20px] text-white" style={sans}>{name}</p>
                {profile?.username ? (
                  <Link href={`/${profile.username}`} className="text-[13px] text-[#A09EA3]" style={sans}>@{profile.username}</Link>
                ) : null}
                {profile ? (
                  <div className="mt-2">
                    <PillTag label={roleLabel(profile.role)} size="sm" variant="ghost-green" />
                  </div>
                ) : null}
                <p className="mt-1 text-[12px] text-[#6B6870]" style={sans}>
                  {counts.followerCount} followers · {counts.followingCount} following
                </p>
              </div>
            </div>
            {bio ? (
              <p className="mb-4 whitespace-pre-wrap text-[14px] leading-6 text-[#A09EA3]" style={sans}>{bio}</p>
            ) : null}
            {viewerId && viewerId !== userId ? (
              <button
                type="button"
                onClick={handleFollow}
                disabled={busy}
                className="mb-4 rounded-full bg-[#F5F5F5] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#141115] disabled:opacity-40"
                style={sans}
              >
                {following ? 'Unfollow' : 'Follow'}
              </button>
            ) : null}
            {followError ? <StatusMessage tone="error">{followError}</StatusMessage> : null}
            {posts.length === 0 ? <StatusMessage>No posts yet.</StatusMessage> : null}
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onLike={() => handleLike(post)} />
            ))}
            {hasNext && cursor ? (
              <button
                type="button"
                onClick={async () => {
                  const page = await fetchUserPosts(userId, cursor)
                  setPosts((current) => [...current, ...page.data])
                  setCursor(page.nextCursor)
                  setHasNext(page.hasNext)
                }}
                className="mt-4 w-full border border-[#3A373C] py-3 text-[11px] uppercase tracking-[0.16em] text-[#A09EA3]"
                style={sans}
              >
                Load more
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
