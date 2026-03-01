// ─────────────────────────────────────────────
// PLATFORM TYPES
// ─────────────────────────────────────────────

export type TrainingLog = {
  id: string
  user_id: string
  title: string
  logged_date: string
  duration_minutes: number | null
  workout_log: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export type Event = {
  id: string
  title: string
  description: string | null
  location: string | null
  event_date: string
  event_time: string | null
  max_capacity: number | null
  image_url: string | null
  status: 'draft' | 'published' | 'cancelled'
  created_at: string
  updated_at: string
}

export type EventSignup = {
  id: string
  event_id: string
  user_id: string
  status: 'confirmed' | 'cancelled'
  signed_up_at: string
}
