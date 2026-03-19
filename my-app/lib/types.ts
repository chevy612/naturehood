// ─────────────────────────────────────────────
// PLATFORM TYPES
// ─────────────────────────────────────────────

// ── AI ───────────────────────────────────────

export type AiStructuredExercise = {
  name: string
  sets?: number
  reps?: number | string
  weight_kg?: number
  distance_km?: number
  duration_seconds?: number
  notes?: string
}

export type AiStructuredWorkout = {
  exercises: AiStructuredExercise[]
  summary?: string
  estimated_intensity?: 'low' | 'moderate' | 'high'
}

// ── Core entities ─────────────────────────────

export type TrainingLog = {
  id: string
  user_id: string
  title: string
  logged_date: string
  duration_minutes: number | null
  workout_log: string | null
  is_public: boolean
  like_count: number
  ai_structured: AiStructuredWorkout | null
  ai_formatted_at: string | null
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
