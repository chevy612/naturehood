import type { MealType, WorkoutPostRecord } from '@/lib/social/post-content'

export type ShareRole = 'athlete' | 'coach'
export type ShareStatus = 'pending' | 'accepted' | 'revoked'

export type ShareScope = {
  shareMeals: boolean
  shareWorkouts: boolean
}

export type PeerProfile = {
  id: string
  username: string | null
  name: string | null
  avatar_url: string | null
}

// Row shape returned by the `list_my_shares` RPC.
export type ShareRow = {
  share_id: string
  athlete_id: string
  viewer_id: string
  share_meals: boolean
  share_workouts: boolean
  status: ShareStatus
  invite_source: 'invite' | 'link'
  athlete_note: string | null
  viewer_note: string | null
  my_note: string | null
  peer_id: string
  peer_username: string | null
  peer_name: string | null
  peer_avatar_url: string | null
  created_at: string
  updated_at: string
}

export type ShareLink = {
  id: string
  token: string
  shareMeals: boolean
  shareWorkouts: boolean
  createdAt: string
  url: string
}

export type ShareLinkInvalidReason = 'not_found' | 'inactive' | 'expired' | 'own_link'

export type ShareLinkPeek = {
  valid: boolean
  reason: ShareLinkInvalidReason | null
  athlete: { id: string; username: string | null; name: string | null; avatar_url: string | null } | null
  share_meals: boolean
  share_workouts: boolean
  expires_at: string | null
  existing_status: ShareStatus | null
}

export type SharedWorkout = WorkoutPostRecord & { created_at: string }

export type SharedMeal = {
  id: string
  title: string | null
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  meal_type: MealType | null
  image_url: string | null
  notes: string | null
  created_at: string
}

export type LogType = 'workout' | 'meal'
