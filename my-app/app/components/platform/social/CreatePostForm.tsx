'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus, X } from 'lucide-react'
import { Avatar } from '@/app/components/platform/Avatar'
import { InputDark, TextAreaDark } from '@/app/components/ui/inputs'
import { WorkoutFormFields } from '@/app/(platform)/record/WorkoutFormFields'
import { useWorkoutTypes } from '@/app/(platform)/record/useWorkoutTypes'
import { getUserWorkoutTypes, saveWorkout } from '@/app/(platform)/record/actions'
import { MealPostCard } from '@/app/components/platform/social/MealPostCard'
import { StatusMessage } from '@/app/components/platform/social/StatusMessage'
import { WorkoutAttachmentCard } from '@/app/components/platform/social/WorkoutAttachmentCard'
import {
  analyzeMeal,
  createSocialPost,
  fetchCurrentProfile,
  fetchOwnRecords,
  insertMealRecord,
  uploadImages,
  type FeedProfile,
} from '@/lib/social/browser'
import { sans } from '@/lib/social/format'
import {
  MEAL_TYPE_LABELS,
  MEAL_TYPES,
  POST_TYPE,
  serializeMealLogPostPayload,
  serializeWorkoutLogPostPayload,
  type MealPostRecord,
  type MealType,
  type PostRecordAttachment,
  type WorkoutPostRecord,
} from '@/lib/social/post-content'

const MAX_CONTENT = 1000
const MAX_IMAGES = 4
const MAX_POST_CONTENT = 5000

type Panel = 'attach' | 'workout' | 'meal' | null

export function CreatePostForm({ initialAttachment = null }: { initialAttachment?: PostRecordAttachment | null }) {
  const router = useRouter()
  const [profile, setProfile] = useState<FeedProfile | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [attachment, setAttachment] = useState<PostRecordAttachment | null>(initialAttachment)
  const [panel, setPanel] = useState<Panel>(null)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCurrentProfile().then((current) => {
      if (!current) return
      setUserId(current.userId)
      setProfile(current.profile)
    }).catch(() => setError('Could not load your profile.'))
  }, [])

  const canPost = useMemo(
    () => Boolean(userId) && (content.trim().length > 0 || files.length > 0 || !!attachment) && content.length <= MAX_CONTENT && !posting,
    [attachment, content, files.length, posting, userId]
  )

  function addFiles(list: FileList | null) {
    if (!list) return
    const next = [...files, ...Array.from(list)].slice(0, MAX_IMAGES)
    if (files.length + list.length > MAX_IMAGES) {
      setError(`A post can have at most ${MAX_IMAGES} images.`)
    } else {
      setError(null)
    }
    previews.forEach((preview) => URL.revokeObjectURL(preview))
    setFiles(next)
    setPreviews(next.map((file) => URL.createObjectURL(file)))
  }

  async function handlePost() {
    if (!canPost || !userId) return
    setPosting(true)
    setError(null)
    try {
      const uploaded = files.length ? await uploadImages('post_images', userId, files) : { urls: [], error: null }
      if (uploaded.error) {
        setError(uploaded.error)
        setPosting(false)
        return
      }

      let body = content.trim()
      let images = uploaded.urls
      let contentType: string = POST_TYPE.NORMAL_POST
      if (attachment?.kind === 'workout') {
        body = serializeWorkoutLogPostPayload({
          version: 1,
          kind: 'workout_log',
          userText: content.trim(),
          workout: attachment.workout,
        })
        contentType = POST_TYPE.WORKOUT_LOG
      } else if (attachment?.kind === 'meal') {
        body = serializeMealLogPostPayload({
          version: 1,
          kind: 'meal_log',
          userText: content.trim(),
          meal: attachment.meal,
        })
        images = [attachment.meal.image_url, ...uploaded.urls].filter((url): url is string => !!url).slice(0, MAX_IMAGES)
        contentType = POST_TYPE.MEAL_LOG
      }

      if (body.length > MAX_POST_CONTENT) {
        setError('This post is too long to publish. Shorten the note or the attached log.')
        setPosting(false)
        return
      }

      await createSocialPost({ content: body, images, contentType })
      router.push('/home')
      router.refresh()
    } catch (postError) {
      setError(postError instanceof Error ? postError.message : 'Could not create the post.')
      setPosting(false)
    }
  }

  const name = profile?.name || profile?.username || 'You'
  const placeholder = attachment?.kind === 'workout'
    ? 'Add context to this workout'
    : attachment?.kind === 'meal'
      ? 'Add context to this meal'
      : 'Share something'

  return (
    <div className="min-h-screen bg-[#141115] px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <button type="button" onClick={() => router.push('/home')} aria-label="Close" className="text-white">
            <X size={22} />
          </button>
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white" style={sans}>New post</p>
          <button
            type="button"
            onClick={handlePost}
            disabled={!canPost}
            className="rounded-full bg-[#F5F5F5] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#141115] disabled:opacity-40"
            style={sans}
          >
            {posting ? 'Posting…' : 'Post'}
          </button>
        </div>

        <div className="flex gap-3">
          <Avatar name={name} photoUrl={profile?.avatar_url} size="md" />
          <textarea
            autoFocus
            value={content}
            onChange={(event) => setContent(event.target.value.slice(0, MAX_CONTENT))}
            placeholder={placeholder}
            rows={5}
            maxLength={MAX_CONTENT}
            className="min-h-28 w-full resize-none bg-transparent text-[16px] text-white outline-none placeholder:text-[#6B6870]"
            style={sans}
          />
        </div>

        {attachment ? (
          <div className="relative mt-4">
            {attachment.kind === 'workout'
              ? <WorkoutAttachmentCard workout={attachment.workout} />
              : <MealPostCard meal={attachment.meal} />}
            <button
              type="button"
              aria-label="Remove attachment"
              onClick={() => setAttachment(null)}
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <X size={12} />
            </button>
          </div>
        ) : null}

        {previews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {previews.map((preview, index) => (
              <div key={preview} className="relative aspect-square overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => {
                    URL.revokeObjectURL(preview)
                    setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))
                    setPreviews((current) => current.filter((_, itemIndex) => itemIndex !== index))
                  }}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-[#3A373C] pt-3">
          <div className="flex items-center gap-2">
            <label className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-3 text-[12px] uppercase tracking-[0.12em] text-white ${files.length >= MAX_IMAGES || posting ? 'opacity-40' : ''}`} style={sans}>
              <ImagePlus size={16} />
              Photo
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={files.length >= MAX_IMAGES || posting}
                onChange={(event) => {
                  addFiles(event.target.files)
                  event.target.value = ''
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => setPanel(panel === 'attach' ? null : 'attach')}
              disabled={posting}
              className="h-10 rounded-full px-3 text-[12px] uppercase tracking-[0.12em] text-white disabled:opacity-40"
              style={sans}
            >
              Attach
            </button>
          </div>
          <span className="text-[12px] text-[#6B6870]" style={sans}>{content.length}/{MAX_CONTENT}</span>
        </div>

        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

        {panel === 'attach' && userId ? (
          <RecordPicker
            userId={userId}
            selected={attachment}
            onSelect={(next) => {
              setAttachment(next)
              setPanel(null)
              setError(null)
            }}
            onLogWorkout={() => setPanel('workout')}
            onLogMeal={() => setPanel('meal')}
          />
        ) : null}
        {panel === 'workout' && userId ? (
          <LogWorkoutPanel
            onCancel={() => setPanel('attach')}
            onSaved={(workout) => {
              setAttachment({ kind: 'workout', workout })
              setPanel(null)
              setError(null)
            }}
          />
        ) : null}
        {panel === 'meal' && userId ? (
          <LogMealPanel
            userId={userId}
            onCancel={() => setPanel('attach')}
            onSaved={(meal) => {
              setAttachment({ kind: 'meal', meal })
              setPanel(null)
            }}
            onError={setError}
          />
        ) : null}
      </div>
    </div>
  )
}

export function RecordPicker({
  userId,
  selected,
  selectedWorkoutId,
  selectedMealId,
  onSelect,
  onLogWorkout,
  onLogMeal,
}: {
  userId: string
  selected: PostRecordAttachment | null
  selectedWorkoutId?: string | null
  selectedMealId?: string | null
  onSelect: (attachment: PostRecordAttachment) => void
  onLogWorkout: () => void
  onLogMeal: () => void
}) {
  const workoutSelection = selectedWorkoutId ?? (selected?.kind === 'workout' ? selected.workout.id : null)
  const mealSelection = selectedMealId ?? (selected?.kind === 'meal' ? selected.meal.id : null)
  const [tab, setTab] = useState<'workout' | 'meal'>('workout')
  const [workouts, setWorkouts] = useState<WorkoutPostRecord[]>([])
  const [meals, setMeals] = useState<MealPostRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchOwnRecords(userId)
      .then((records) => {
        if (cancelled) return
        setWorkouts(records.workouts)
        setMeals(records.meals)
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Unable to load records.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  return (
    <div className="mt-4 rounded-2xl border border-[#3A373C] bg-[#1E1B1F] p-3">
      <p className="mb-3 text-center text-[14px] text-white" style={sans}>Attach a record</p>
      <div className="mb-3 grid grid-cols-2 rounded-xl border border-[#3A373C] p-1">
        {(['workout', 'meal'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`h-9 rounded-lg text-[13px] ${tab === key ? 'bg-[#F5F5F5] text-[#141115]' : 'text-[#A09EA3]'}`}
            style={sans}
          >
            {key === 'workout' ? 'Workout log' : 'Meal record'}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={tab === 'workout' ? onLogWorkout : onLogMeal}
        className="mb-3 w-full rounded-full border border-[#F5F5F5] py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F5F5F5]"
        style={sans}
      >
        {tab === 'workout' ? 'Log a workout' : 'Log a meal'}
      </button>
      {loading ? <StatusMessage>Loading records…</StatusMessage> : null}
      {!loading && error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
      {!loading && !error && tab === 'workout' && workouts.length === 0 ? <StatusMessage>No workout logs yet.</StatusMessage> : null}
      {!loading && !error && tab === 'meal' && meals.length === 0 ? <StatusMessage>No meal records yet.</StatusMessage> : null}
      <div className="flex max-h-80 flex-col gap-2 overflow-auto">
        {tab === 'workout' ? workouts.map((workout) => {
          const active = workoutSelection === workout.id
          return (
            <button key={workout.id} type="button" onClick={() => onSelect({ kind: 'workout', workout })} className={`rounded-xl border p-3 text-left ${active ? 'border-[#F5F5F5]' : 'border-[#3A373C]'}`}>
              <p className="text-[14px] text-white" style={sans}>{workout.title}</p>
              <p className="text-[12px] text-[#6B6870]" style={sans}>{workout.logged_date}{workout.duration_minutes ? ` · ${workout.duration_minutes} min` : ''}</p>
            </button>
          )
        }) : meals.map((meal) => {
          const active = mealSelection === meal.id
          return (
            <button key={meal.id} type="button" onClick={() => onSelect({ kind: 'meal', meal })} className={`rounded-xl border p-3 text-left ${active ? 'border-[#F5F5F5]' : 'border-[#3A373C]'}`}>
              <p className="text-[14px] text-white" style={sans}>{meal.title || 'Untitled meal'}</p>
              <p className="text-[12px] text-[#6B6870]" style={sans}>
                {[meal.meal_type ? MEAL_TYPE_LABELS[meal.meal_type] : null, meal.calories != null ? `${Math.round(meal.calories)} kcal` : null, meal.protein != null ? `${Math.round(meal.protein)}g protein` : null].filter(Boolean).join(' · ') || 'Nutrition not added'}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function LogWorkoutPanel({
  onCancel,
  onSaved,
}: {
  onCancel: () => void
  onSaved: (workout: WorkoutPostRecord) => void
}) {
  const today = new Date().toISOString().split('T')[0]
  const [title, setTitle] = useState('')
  const [loggedDate, setLoggedDate] = useState(today)
  const [duration, setDuration] = useState('')
  const [workoutLog, setWorkoutLog] = useState('')
  const [previousTypes, setPreviousTypes] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const types = useWorkoutTypes()

  useEffect(() => {
    getUserWorkoutTypes().then(setPreviousTypes).catch(() => setPreviousTypes([]))
  }, [])

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    const pendingType = types.typeInput.trim()
    const workoutTypes = pendingType && !types.workoutTypes.includes(pendingType)
      ? [...types.workoutTypes, pendingType]
      : types.workoutTypes
    types.commitPendingType()
    if (!title.trim()) {
      setError('Workout title is required.')
      return
    }
    setSaving(true)
    setError(null)
    const formData = new FormData()
    formData.set('title', title.trim())
    formData.set('logged_date', loggedDate)
    formData.set('duration_minutes', duration)
    formData.set('workout_types', JSON.stringify(workoutTypes))
    formData.set('workout_log', workoutLog)
    formData.set('is_public', 'true')
    const result = await saveWorkout(formData)
    setSaving(false)
    if (result?.error || !result?.id) {
      setError(result?.error ?? 'Failed to save workout.')
      return
    }
    const durationValue = duration ? parseInt(duration, 10) : null
    onSaved({
      id: result.id,
      title: title.trim(),
      logged_date: loggedDate,
      duration_minutes: durationValue && !Number.isNaN(durationValue) ? durationValue : null,
      workout_types: workoutTypes,
      workout_log: workoutLog.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSave} className="mt-4 space-y-5 rounded-2xl border border-[#3A373C] bg-[#1A1719] p-4">
      <div className="flex items-center justify-between">
        <p className="text-[12px] uppercase tracking-[0.16em] text-white" style={sans}>New workout</p>
        <button type="button" onClick={onCancel} className="text-[12px] uppercase tracking-[0.12em] text-[#A09EA3]" style={sans}>Back</button>
      </div>
      <WorkoutFormFields
        title={title}
        loggedDate={loggedDate}
        duration={duration}
        workoutLog={workoutLog}
        isPublic
        showVisibility={false}
        onTitleChange={setTitle}
        onDateChange={setLoggedDate}
        onDurationChange={setDuration}
        onWorkoutLogChange={setWorkoutLog}
        onIsPublicChange={() => undefined}
        workoutTypes={types.workoutTypes}
        typeInput={types.typeInput}
        onTypeInputChange={types.setTypeInput}
        onTypeKeyDown={types.handleTypeKeyDown}
        onTypeBlur={types.handleTypeBlur}
        onRemoveType={types.removeType}
        onAddType={types.addWorkoutType}
        previousTypes={previousTypes}
      />
      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
      <button type="submit" disabled={saving} className="w-full rounded-full bg-[#F5F5F5] py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-[#141115] disabled:opacity-40" style={sans}>
        {saving ? 'Saving…' : 'Save and attach'}
      </button>
    </form>
  )
}

export function LogMealPanel({
  userId,
  onCancel,
  onSaved,
  onError,
}: {
  userId: string
  onCancel: () => void
  onSaved: (meal: MealPostRecord) => void
  onError: (message: string | null) => void
}) {
  const [title, setTitle] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [mealType, setMealType] = useState<MealType | null>(null)
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [analyzeWithAI, setAnalyzeWithAI] = useState(false)
  const [titleError, setTitleError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview)
  }, [preview])

  function digits(value: string) {
    return value.replace(/\D/g, '').slice(0, 6)
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim()) {
      setTitleError(true)
      return
    }
    setSaving(true)
    setError(null)
    onError(null)
    try {
      let imageUrl: string | null = null
      if (file) {
        const uploaded = await uploadImages('food_images', userId, [file])
        if (uploaded.error || !uploaded.urls[0]) {
          setError(uploaded.error ?? 'Could not upload the meal photo.')
          setSaving(false)
          return
        }
        imageUrl = uploaded.urls[0]
      }
      const mealId = crypto.randomUUID()
      const parsedCalories = calories ? Number(calories) : null
      const parsedProtein = protein ? Number(protein) : null
      await insertMealRecord({
        mealId,
        userId,
        title: title.trim(),
        calories: parsedCalories,
        protein: parsedProtein,
        mealType,
        notes: notes.trim() || null,
        imageUrl,
      })

      let meal: MealPostRecord = {
        id: mealId,
        title: title.trim(),
        calories: parsedCalories,
        protein: parsedProtein,
        carbs: null,
        fat: null,
        meal_type: mealType,
        image_url: imageUrl,
        notes: notes.trim() || null,
      }

      if (analyzeWithAI && imageUrl) {
        try {
          const analysis = await analyzeMeal(mealId)
          meal = {
            ...meal,
            calories: analysis.calories,
            protein: analysis.protein,
            carbs: analysis.carbs,
            fat: analysis.fat,
          }
        } catch (analysisError) {
          onError(analysisError instanceof Error
            ? `${analysisError.message} The meal was saved and attached.`
            : 'AI analysis failed. The meal was saved and attached.')
        }
      }
      onSaved(meal)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the meal.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="mt-4 space-y-5 rounded-2xl border border-[#3A373C] bg-[#1A1719] p-4">
      <div className="flex items-center justify-between">
        <p className="text-[12px] uppercase tracking-[0.16em] text-white" style={sans}>Log meal</p>
        <button type="button" onClick={onCancel} className="text-[12px] uppercase tracking-[0.12em] text-[#A09EA3]" style={sans}>Back</button>
      </div>

      {preview ? (
        <div className="relative overflow-hidden rounded-xl border border-[#3A373C]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="h-56 w-full object-cover" />
          <button
            type="button"
            aria-label="Remove meal photo"
            onClick={() => {
              if (preview) URL.revokeObjectURL(preview)
              setPreview(null)
              setFile(null)
              setAnalyzeWithAI(false)
            }}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#3A373C] bg-[#1E1B1F] px-5 py-8 text-[14px] text-[#A09EA3]" style={sans}>
          Choose a photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const next = event.target.files?.[0]
              if (!next) return
              if (preview) URL.revokeObjectURL(preview)
              setFile(next)
              setPreview(URL.createObjectURL(next))
              event.target.value = ''
            }}
          />
        </label>
      )}

      <InputDark
        label="Title"
        name="meal-title"
        value={title}
        required
        error={titleError ? 'Title is required' : undefined}
        placeholder="What did you eat?"
        onChange={(event) => {
          setTitle(event.target.value.slice(0, 100))
          if (event.target.value.trim()) setTitleError(false)
        }}
      />
      <InputDark
        label="Calories"
        name="meal-calories"
        value={calories}
        placeholder="Optional"
        onChange={(event) => setCalories(digits(event.target.value))}
      />
      <InputDark
        label="Protein (g)"
        name="meal-protein"
        value={protein}
        placeholder="Optional"
        onChange={(event) => setProtein(digits(event.target.value))}
      />
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-[0.04em] text-[#6B6870]" style={{ fontFamily: "'Sk Modernist', sans-serif" }}>Meal type</p>
        <div className="flex flex-wrap gap-2">
          {MEAL_TYPES.map((type) => {
            const selected = mealType === type
            return (
              <button
                key={type}
                type="button"
                onClick={() => setMealType(selected ? null : type)}
                className={`rounded-full px-3 py-1 text-[12px] ${selected ? 'bg-[#F5F5F5] text-[#141115]' : 'border border-[#3A373C] text-[#A09EA3]'}`}
                style={sans}
              >
                {MEAL_TYPE_LABELS[type]}
              </button>
            )
          })}
        </div>
      </div>
      <TextAreaDark
        label="Notes"
        name="meal-notes"
        value={notes}
        rows={4}
        placeholder="Optional notes"
        onChange={(event) => setNotes(event.target.value.slice(0, 400))}
      />
      <label className="flex items-center justify-between gap-3 text-[13px] text-[#A09EA3]" style={sans}>
        Analyze photo with AI
        <input
          type="checkbox"
          checked={analyzeWithAI}
          disabled={!file || saving}
          onChange={(event) => setAnalyzeWithAI(event.target.checked)}
        />
      </label>
      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
      <button type="submit" disabled={saving} className="w-full rounded-full bg-[#F5F5F5] py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-[#141115] disabled:opacity-40" style={sans}>
        {saving ? 'Saving…' : 'Save and attach'}
      </button>
    </form>
  )
}
