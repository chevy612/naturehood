'use client'

import { createClient } from '@/lib/supabase/client'
import type { SocialCommentDto, SocialPostDto } from '@/lib/social/types'
import type { MealPostRecord, MealType, WorkoutPostRecord } from '@/lib/social/post-content'
import { USER_SEARCH_LIMIT, usernameSearchPattern } from '@/lib/social/user-search'

export type FeedProfile = {
  id: string
  username: string | null
  name: string | null
  avatar_url: string | null
}

export type ProfileDetail = FeedProfile & {
  bio: string | null
  role: string | null
}

export type UserSearchResult = FeedProfile

export type EnrichedPost = SocialPostDto & { profile: FeedProfile | null }
export type EnrichedComment = Omit<SocialCommentDto, 'replies'> & {
  profile: FeedProfile | null
  replies: EnrichedComment[] | null
}

export type FeedPage<T> = {
  data: T[]
  nextCursor: string | null
  hasNext: boolean
}

type ApiResponse<T> = {
  success: boolean
  data: T | null
  error: string | null
}

async function socialFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  if (init?.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const response = await fetch(path, { ...init, headers })
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error ?? `Request failed (${response.status})`)
  }
  return payload.data as T
}

export async function fetchProfiles(userIds: string[]): Promise<Record<string, FeedProfile>> {
  const ids = [...new Set(userIds.filter(Boolean))]
  if (!ids.length) return {}
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, name, avatar_url')
    .in('id', ids)
  if (error) throw new Error(error.message)
  return Object.fromEntries((data ?? []).map((profile) => [profile.id, profile as FeedProfile]))
}

export async function fetchProfileDetail(userId: string): Promise<ProfileDetail | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, name, avatar_url, bio, role')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data as ProfileDetail | null) ?? null
}

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const pattern = usernameSearchPattern(query)
  if (!pattern) return []
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, name, avatar_url')
    .ilike('username', pattern)
    .order('username', { ascending: true })
    .limit(USER_SEARCH_LIMIT)
  if (error) throw new Error(error.message)
  return (data ?? []) as UserSearchResult[]
}

function enrichPosts(posts: SocialPostDto[], profiles: Record<string, FeedProfile>): EnrichedPost[] {
  return posts.map((post) => ({ ...post, profile: profiles[post.authorId] ?? null }))
}

function enrichComments(comments: SocialCommentDto[], profiles: Record<string, FeedProfile>): EnrichedComment[] {
  return comments.map((comment) => {
    const { replies, ...rest } = comment
    return {
      ...rest,
      images: rest.images ?? [],
      videos: rest.videos ?? [],
      profile: profiles[comment.authorId] ?? null,
      replies: replies ? enrichComments(replies, profiles) : null,
    }
  })
}

function collectCommentAuthorIds(comments: SocialCommentDto[], ids: Set<string>) {
  for (const comment of comments) {
    ids.add(comment.authorId)
    if (comment.replies?.length) collectCommentAuthorIds(comment.replies, ids)
  }
}

export async function fetchFeedPage(cursor?: string | null): Promise<FeedPage<EnrichedPost>> {
  const params = new URLSearchParams({ limit: '20' })
  if (cursor) params.set('cursor', cursor)
  const page = await socialFetch<FeedPage<SocialPostDto>>(`/api/feed?${params}`)
  const profiles = await fetchProfiles(page.data.map((post) => post.authorId))
  return { ...page, data: enrichPosts(page.data, profiles) }
}

export async function searchPostsPage(query: string, cursor?: string | null): Promise<FeedPage<EnrichedPost>> {
  const params = new URLSearchParams({ q: query, limit: '20' })
  if (cursor) params.set('cursor', cursor)
  const page = await socialFetch<FeedPage<SocialPostDto>>(`/api/posts/search?${params}`)
  const profiles = await fetchProfiles(page.data.map((post) => post.authorId))
  return { ...page, data: enrichPosts(page.data, profiles) }
}

export async function fetchPost(postId: string): Promise<EnrichedPost> {
  const post = await socialFetch<SocialPostDto>(`/api/posts/${postId}`)
  const profiles = await fetchProfiles([post.authorId])
  return { ...post, profile: profiles[post.authorId] ?? null }
}

export async function createSocialPost(input: {
  content: string
  images: string[]
  contentType: string
}): Promise<EnrichedPost> {
  const post = await socialFetch<SocialPostDto>('/api/posts', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  const profiles = await fetchProfiles([post.authorId])
  return { ...post, profile: profiles[post.authorId] ?? null }
}

export async function togglePostLike(postId: string): Promise<{ liked: boolean }> {
  return socialFetch<{ liked: boolean }>(`/api/posts/${postId}/like`, { method: 'POST' })
}

export async function fetchComments(postId: string, cursor?: string | null): Promise<FeedPage<EnrichedComment>> {
  const params = new URLSearchParams({ limit: '20' })
  if (cursor) params.set('cursor', cursor)
  const page = await socialFetch<FeedPage<SocialCommentDto>>(`/api/posts/${postId}/comments?${params}`)
  const ids = new Set<string>()
  collectCommentAuthorIds(page.data, ids)
  const profiles = await fetchProfiles([...ids])
  return { ...page, data: enrichComments(page.data, profiles) }
}

export async function fetchReplies(postId: string, commentId: string): Promise<EnrichedComment[]> {
  const page = await socialFetch<FeedPage<SocialCommentDto>>(
    `/api/posts/${postId}/comments/${commentId}/replies?limit=50`
  )
  const ids = new Set<string>()
  collectCommentAuthorIds(page.data, ids)
  const profiles = await fetchProfiles([...ids])
  return enrichComments(page.data, profiles)
}

export async function createSocialComment(postId: string, input: {
  content: string
  parentCommentId?: string | null
  images?: string[]
  videos?: string[]
  contentType?: string
}): Promise<EnrichedComment> {
  const comment = await socialFetch<SocialCommentDto>(`/api/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
  const profiles = await fetchProfiles([comment.authorId])
  const { replies, ...rest } = comment
  return {
    ...rest,
    images: rest.images ?? [],
    videos: rest.videos ?? [],
    profile: profiles[comment.authorId] ?? null,
    replies: replies ? enrichComments(replies, profiles) : null,
  }
}

export async function toggleCommentLike(postId: string, commentId: string): Promise<{ liked: boolean }> {
  return socialFetch<{ liked: boolean }>(`/api/posts/${postId}/comments/${commentId}/like`, { method: 'POST' })
}

export async function fetchUserPosts(userId: string, cursor?: string | null): Promise<FeedPage<EnrichedPost>> {
  const params = new URLSearchParams({ limit: '20' })
  if (cursor) params.set('cursor', cursor)
  const page = await socialFetch<FeedPage<SocialPostDto>>(`/api/users/${userId}/posts?${params}`)
  const profiles = await fetchProfiles(page.data.map((post) => post.authorId))
  return { ...page, data: enrichPosts(page.data, profiles) }
}

export async function fetchFollowStatus(userId: string): Promise<{ following: boolean }> {
  return socialFetch<{ following: boolean }>(`/api/users/${userId}/is-following`)
}

export async function fetchFollowCounts(userId: string): Promise<{ followerCount: number; followingCount: number }> {
  return socialFetch<{ followerCount: number; followingCount: number }>(`/api/users/${userId}/follow-counts`)
}

// Single write path for follow/unfollow (PUT/DELETE /api/users/[userId]/follow ->
// follow_social_user / unfollow_social_user). Hook follow side effects there.
export async function setFollowing(userId: string, following: boolean): Promise<{ following: boolean }> {
  return socialFetch<{ following: boolean }>(`/api/users/${userId}/follow`, {
    method: following ? 'PUT' : 'DELETE',
  })
}

export async function fetchCurrentProfile(): Promise<{ userId: string; profile: FeedProfile | null } | null> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  const profiles = await fetchProfiles([data.user.id])
  return { userId: data.user.id, profile: profiles[data.user.id] ?? null }
}

function extensionForUpload(file: File) {
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  if (file.type === 'image/gif') return 'gif'
  if (file.type === 'video/webm') return 'webm'
  if (file.type === 'video/quicktime') return 'mov'
  if (file.type.startsWith('video/')) return 'mp4'
  return 'jpg'
}

export async function uploadImages(bucket: string, userId: string, files: File[]): Promise<{ urls: string[]; error: string | null }> {
  const supabase = createClient()
  const urls: string[] = []
  for (const [index, file] of files.entries()) {
    const extension = extensionForUpload(file)
    const path = `${userId}/${Date.now()}-${index}-${Math.random().toString(36).slice(2)}.${extension}`
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: false,
      contentType: file.type || 'image/jpeg',
    })
    if (error) return { urls, error: error.message }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    urls.push(data.publicUrl)
  }
  return { urls, error: null }
}

type MealRow = {
  meal_id: string
  title: string | null
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  meal_type: MealType | null
  user_notes: string | null
  ai_analysis: unknown
  s3_link: string | null
  created_at: string
  updated_at: string | null
}

export async function fetchOwnRecords(userId: string): Promise<{
  workouts: WorkoutPostRecord[]
  meals: MealPostRecord[]
}> {
  const supabase = createClient()
  const [workoutResult, mealResult] = await Promise.all([
    supabase
      .from('training_logs')
      .select('id, title, logged_date, duration_minutes, workout_types, workout_log')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(40),
    supabase
      .from('meal_records')
      .select('meal_id, title, calories, protein, carbs, fat, meal_type, user_notes, ai_analysis, s3_link, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(40),
  ])
  if (workoutResult.error) throw new Error(workoutResult.error.message)
  if (mealResult.error) throw new Error(mealResult.error.message)

  const workouts = (workoutResult.data ?? []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    logged_date: row.logged_date as string,
    duration_minutes: (row.duration_minutes as number | null) ?? null,
    workout_types: (row.workout_types as string[] | null) ?? [],
    workout_log: (row.workout_log as string | null) ?? null,
  }))

  return { workouts, meals: keepLatestMeals((mealResult.data ?? []) as MealRow[]) }
}

function mealTimestamp(row: MealRow) {
  const updated = Date.parse(row.updated_at ?? '')
  if (!Number.isNaN(updated)) return updated
  const created = Date.parse(row.created_at)
  return Number.isNaN(created) ? 0 : created
}

function keepLatestMeals(rows: MealRow[]): MealPostRecord[] {
  const groups = new Map<string, MealRow[]>()
  for (const row of rows) {
    const key = row.title?.trim().toLowerCase() || row.meal_id
    const group = groups.get(key)
    if (group) group.push(row)
    else groups.set(key, [row])
  }
  const kept: MealRow[] = []
  for (const group of groups.values()) {
    const analysed = group.filter((row) => row.ai_analysis != null)
    const pool = analysed.length > 0 ? analysed : group
    pool.sort((a, b) => mealTimestamp(b) - mealTimestamp(a))
    kept.push(pool[0])
  }
  kept.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
  return kept.map((row) => ({
    id: row.meal_id,
    title: row.title,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    meal_type: row.meal_type,
    image_url: row.s3_link,
    notes: row.user_notes,
  }))
}

export async function insertMealRecord(input: {
  mealId: string
  userId: string
  title: string
  calories: number | null
  protein: number | null
  mealType: MealType | null
  notes: string | null
  imageUrl: string | null
}): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('meal_records').insert({
    meal_id: input.mealId,
    user_id: input.userId,
    title: input.title || null,
    weight: null,
    calories: input.calories,
    protein: input.protein,
    carbs: null,
    fat: null,
    meal_type: input.mealType,
    user_notes: input.notes,
    ai_analysis: null,
    s3_link: input.imageUrl,
  })
  if (error) throw new Error(error.message)
}

export async function analyzeMeal(mealId: string): Promise<{
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
}> {
  const response = await fetch('/api/ai/analyze-food', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ meal_id: mealId }),
  })
  const payload = await response.json().catch(() => null) as {
    error?: string
    calories?: number | null
    protein?: number | null
    carbs?: number | null
    fat?: number | null
  } | null
  if (!response.ok) throw new Error(payload?.error ?? 'AI analysis failed')
  return {
    calories: payload?.calories ?? null,
    protein: payload?.protein ?? null,
    carbs: payload?.carbs ?? null,
    fat: payload?.fat ?? null,
  }
}
