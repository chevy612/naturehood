'use client'

import { createClient } from '@/lib/supabase/client'
import { buildShareUrl } from '@/lib/team/share-url'
import type {
  LogType,
  PeerProfile,
  ShareLink,
  ShareLinkPeek,
  ShareRole,
  ShareRow,
  ShareScope,
  SharedMeal,
  SharedWorkout,
} from '@/lib/team/types'

export { buildShareUrl }

export const NOTE_MAX_LENGTH = 200

const ERROR_MESSAGES: Record<string, string> = {
  not_authenticated: 'Please sign in again.',
  forbidden: 'You are not allowed to do that.',
  share_not_found: 'This share no longer exists.',
  user_not_found: 'That user could not be found.',
  cannot_share_with_self: 'You cannot share with yourself.',
  scope_required: 'Share at least Meal logs or Workout logs. Use Stop sharing to turn both off.',
  share_not_pending: 'This invite was already answered or withdrawn.',
  share_ended: 'This share has ended.',
  note_too_long: `Notes can be at most ${NOTE_MAX_LENGTH} characters.`,
  link_not_found: 'This share link is invalid.',
  link_inactive: 'This share link is no longer active.',
  link_expired: 'This share link has expired.',
  own_link: 'You cannot accept your own share link.',
}

export function teamErrorMessage(error: { message?: string } | null | undefined, fallback = 'Something went wrong.') {
  const raw = error?.message?.trim()
  if (!raw) return fallback
  return ERROR_MESSAGES[raw] ?? raw
}

function unwrap<T>(result: { data: T; error: { message?: string } | null }): NonNullable<T> {
  if (result.error) throw new Error(teamErrorMessage(result.error))
  return result.data as NonNullable<T>
}

export async function fetchCurrentUserId(): Promise<string | null> {
  const { data } = await createClient().auth.getUser()
  return data.user?.id ?? null
}

export async function listMyShares(role: ShareRole): Promise<ShareRow[]> {
  const supabase = createClient()
  const rows = unwrap(await supabase.rpc('list_my_shares', { p_role: role, p_include_revoked: false }))
  return (rows ?? []) as ShareRow[]
}

export async function inviteCoach(viewerId: string, scope: ShareScope): Promise<void> {
  const supabase = createClient()
  unwrap(await supabase.rpc('invite_viewer', {
    p_viewer_id: viewerId,
    p_share_meals: scope.shareMeals,
    p_share_workouts: scope.shareWorkouts,
  }))
}

export async function respondToShare(shareId: string, accept: boolean): Promise<void> {
  unwrap(await createClient().rpc('respond_to_share', { p_share_id: shareId, p_accept: accept }))
}

export async function updateShareOptions(shareId: string, scope: ShareScope): Promise<void> {
  unwrap(await createClient().rpc('update_share_options', {
    p_share_id: shareId,
    p_share_meals: scope.shareMeals,
    p_share_workouts: scope.shareWorkouts,
  }))
}

export async function updateShareNote(shareId: string, note: string): Promise<void> {
  unwrap(await createClient().rpc('update_share_note', { p_share_id: shareId, p_note: note.trim() }))
}

export async function endShare(shareId: string): Promise<void> {
  unwrap(await createClient().rpc('end_share', { p_share_id: shareId }))
}

export async function peekShareLink(token: string): Promise<ShareLinkPeek> {
  return unwrap(await createClient().rpc('peek_share_link', { p_token: token })) as ShareLinkPeek
}

export async function redeemShareLink(token: string): Promise<void> {
  unwrap(await createClient().rpc('redeem_share_link', { p_token: token }))
}

function randomToken() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

// Link rows are owner-only under RLS, so creating one is a plain insert.
export async function createShareLink(athleteId: string, scope: ShareScope): Promise<ShareLink> {
  const supabase = createClient()
  const row = unwrap(await supabase
    .from('athlete_share_links')
    .insert({
      athlete_id: athleteId,
      token: randomToken(),
      share_meals: scope.shareMeals,
      share_workouts: scope.shareWorkouts,
      is_active: true,
    })
    .select('id, token, share_meals, share_workouts, created_at')
    .single())
  return {
    id: row.id,
    token: row.token,
    shareMeals: row.share_meals,
    shareWorkouts: row.share_workouts,
    createdAt: row.created_at,
    url: buildShareUrl(row.token),
  }
}

export async function listActiveShareLinks(): Promise<ShareLink[]> {
  const userId = await fetchCurrentUserId()
  if (!userId) return []
  const rows = unwrap(await createClient()
    .from('athlete_share_links')
    .select('id, token, share_meals, share_workouts, created_at, expires_at')
    .eq('athlete_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false }))
  return rows
    .filter((row) => !row.expires_at || new Date(row.expires_at).getTime() > Date.now())
    .map((row) => ({
      id: row.id,
      token: row.token,
      shareMeals: row.share_meals,
      shareWorkouts: row.share_workouts,
      createdAt: row.created_at,
      url: buildShareUrl(row.token),
    }))
}

export async function deactivateShareLink(linkId: string): Promise<void> {
  unwrap(await createClient()
    .from('athlete_share_links')
    .update({ is_active: false })
    .eq('id', linkId)
    .select('id')
    .single())
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`)
}

export async function searchProfilesByUsername(query: string, excludeUserId: string | null): Promise<PeerProfile[]> {
  const q = query.trim().replace(/^@/, '')
  if (q.length < 2) return []
  const supabase = createClient()
  let request = supabase
    .from('profiles')
    .select('id, username, name, avatar_url')
    .ilike('username', `%${escapeLike(q)}%`)
    .order('username')
    .limit(10)
  if (excludeUserId) request = request.neq('id', excludeUserId)
  return (unwrap(await request) ?? []) as PeerProfile[]
}

export async function fetchPeerProfile(userId: string): Promise<PeerProfile | null> {
  const { data, error } = await createClient()
    .from('profiles')
    .select('id, username, name, avatar_url')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data as PeerProfile | null) ?? null
}

// RLS decides which side sees the row; a Coach only ever gets their own accepted grant.
export async function fetchAcceptedAccess(athleteId: string): Promise<ShareScope | null> {
  const viewerId = await fetchCurrentUserId()
  if (!viewerId) return null
  const { data, error } = await createClient()
    .from('athlete_record_shares')
    .select('share_meals, share_workouts')
    .eq('athlete_id', athleteId)
    .eq('viewer_id', viewerId)
    .eq('status', 'accepted')
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data ? { shareMeals: data.share_meals, shareWorkouts: data.share_workouts } : null
}

export const LOG_PAGE_SIZE = 20

export async function fetchSharedWorkouts(athleteId: string, offset = 0): Promise<SharedWorkout[]> {
  const { data, error } = await createClient()
    .from('training_logs')
    .select('id, title, logged_date, duration_minutes, workout_types, workout_log, created_at')
    .eq('user_id', athleteId)
    .eq('is_deleted', false)
    .order('logged_date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + LOG_PAGE_SIZE - 1)
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    logged_date: row.logged_date,
    duration_minutes: row.duration_minutes,
    workout_types: row.workout_types ?? [],
    workout_log: row.workout_log,
    created_at: row.created_at,
  }))
}

export async function fetchSharedMeals(athleteId: string, offset = 0): Promise<SharedMeal[]> {
  const { data, error } = await createClient()
    .from('meal_records')
    .select('meal_id, title, calories, protein, carbs, fat, meal_type, user_notes, s3_link, created_at')
    .eq('user_id', athleteId)
    .order('created_at', { ascending: false })
    .range(offset, offset + LOG_PAGE_SIZE - 1)
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => ({
    id: row.meal_id,
    title: row.title,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    meal_type: row.meal_type,
    image_url: row.s3_link,
    notes: row.user_notes,
    created_at: row.created_at,
  }))
}

export async function fetchSharedWorkout(logId: string): Promise<SharedWorkout | null> {
  const { data, error } = await createClient()
    .from('training_logs')
    .select('id, user_id, title, logged_date, duration_minutes, workout_types, workout_log, ai_structured, ai_needs_refresh, created_at')
    .eq('id', logId)
    .eq('is_deleted', false)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  return {
    id: data.id,
    title: data.title,
    logged_date: data.logged_date,
    duration_minutes: data.duration_minutes,
    workout_types: data.workout_types ?? [],
    workout_log: data.workout_log,
    ai_structured: data.ai_structured,
    ai_needs_refresh: data.ai_needs_refresh ?? false,
    created_at: data.created_at,
  }
}

export async function fetchSharedMeal(logId: string): Promise<SharedMeal | null> {
  const { data, error } = await createClient()
    .from('meal_records')
    .select('meal_id, user_id, title, weight, calories, protein, carbs, fat, meal_type, user_notes, ai_analysis, s3_link, created_at, updated_at')
    .eq('meal_id', logId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  return {
    id: data.meal_id,
    user_id: data.user_id,
    title: data.title,
    weight: data.weight,
    calories: data.calories,
    protein: data.protein,
    carbs: data.carbs,
    fat: data.fat,
    meal_type: data.meal_type,
    image_url: data.s3_link,
    notes: data.user_notes,
    ai_analysis: data.ai_analysis,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

/** Issues a new link for the scope and turns off every link that was already active. */
export async function rotateShareLink(scope: ShareScope): Promise<ShareLink> {
  const userId = await fetchCurrentUserId()
  if (!userId) throw new Error('not_authenticated')
  const existing = await listActiveShareLinks()
  const created = await createShareLink(userId, scope)
  await Promise.all(existing.filter((link) => link.id !== created.id).map((link) => deactivateShareLink(link.id)))
  return created
}

export async function fetchLogCommentCounts(logType: LogType, logIds: string[]): Promise<Record<string, number>> {
  if (logIds.length === 0) return {}
  const { data, error } = await createClient().rpc('log_comment_counts', { p_log_type: logType, p_log_ids: logIds.slice(0, 200) })
  if (error) throw new Error(error.message)
  return Object.fromEntries(((data ?? []) as { log_id: string; comment_count: number | string }[]).map((row) => [row.log_id, Number(row.comment_count)]))
}
