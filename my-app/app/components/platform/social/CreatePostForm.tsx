'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus, Plus, X } from 'lucide-react'
import { Avatar } from '@/app/components/platform/Avatar'
import { AiAnalysisToggle, MealFormFields } from '@/app/components/platform/meals/MealFormFields'
import { MealPhotoField } from '@/app/components/platform/meals/MealPhotoField'
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
  uploadImages,
  type FeedProfile,
} from '@/lib/social/browser'
import { createMeal, validateMealForm } from '@/lib/meals/browser'
import { EMPTY_MEAL_FORM, type MealFormValues } from '@/lib/meals/types'
import { parseNullableNumber } from '@/lib/meals/utils'
import { sans } from '@/lib/social/format'
import {
  MEAL_TYPE_LABELS,
  POST_TYPE,
  serializeMealLogPostPayload,
  serializeWorkoutLogPostPayload,
  type MealPostRecord,
  type PostRecordAttachment,
  type WorkoutPostRecord,
} from '@/lib/social/post-content'

const MAX_CONTENT = 1000
const MAX_MEDIA = 4
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
    if (!list?.length) return
    const incoming = Array.from(list)
    if (incoming.some((file) => !file.type.startsWith('image/') && !file.type.startsWith('video/'))) {
      setError('Choose photos or videos.')
      return
    }
    const next = [...files, ...incoming].slice(0, MAX_MEDIA)
    if (files.length + incoming.length > MAX_MEDIA) {
      setError(`A post can have at most ${MAX_MEDIA} photos or videos.`)
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
        images = [attachment.meal.image_url, ...uploaded.urls].filter((url): url is string => !!url).slice(0, MAX_MEDIA)
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
              <div key={preview} className="relative aspect-square overflow-hidden rounded-xl bg-black">
                {files[index]?.type.startsWith('video/') ? (
                  <video src={preview} className="h-full w-full object-cover" muted />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                )}
                <button
                  type="button"
                  aria-label="Remove media"
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
            <label className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-3 text-[12px] uppercase tracking-[0.12em] text-white ${files.length >= MAX_MEDIA || posting ? 'opacity-40' : ''}`} style={sans}>
              <ImagePlus size={16} />
              Media
              <input
                aria-label="Post media"
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                disabled={files.length >= MAX_MEDIA || posting}
                onChange={(event) => {
                  addFiles(event.target.files)
                  event.target.value = ''
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => setPanel('attach')}
              disabled={posting || !userId}
              className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-[12px] uppercase tracking-[0.12em] text-white disabled:opacity-40"
              style={sans}
            >
              <Plus size={16} />
              Record
            </button>
          </div>
          <span className="text-[12px] text-[#6B6870]" style={sans}>{content.length}/{MAX_CONTENT}</span>
        </div>

        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

        {panel === 'attach' && userId ? (
          <RecordSheet
            userId={userId}
            selected={attachment}
            onClose={() => setPanel(null)}
            onSelect={(next) => {
              setAttachment(next)
              setPanel(null)
              setError(null)
            }}
          />
        ) : null}
      </div>
    </div>
  )
}

export function RecordSheet({
  userId,
  selected = null,
  selectedWorkoutId,
  selectedMealId,
  onSelect,
  onClose,
}: {
  userId: string
  selected?: PostRecordAttachment | null
  selectedWorkoutId?: string | null
  selectedMealId?: string | null
  onSelect: (attachment: PostRecordAttachment) => void
  onClose: () => void
}) {
  const [view, setView] = useState<'pick' | 'workout' | 'meal'>('pick')
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{ y: number; offset: number } | null>(null)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  function onHandlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    drag.current = { y: event.clientY, offset }
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onHandlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return
    const next = drag.current.offset + (event.clientY - drag.current.y)
    setOffset(Math.max(next, expanded ? -24 : -160))
  }

  function finishDrag() {
    if (!drag.current) return
    drag.current = null
    setDragging(false)
    if (offset > 120) {
      onClose()
      return
    }
    if (!expanded && offset < -70) setExpanded(true)
    if (expanded && offset > 70) setExpanded(false)
    setOffset(0)
  }

  const title = view === 'workout' ? 'Log a workout' : view === 'meal' ? 'Log a meal' : 'Add a record'

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close record sheet" onClick={onClose} className="absolute inset-0 bg-black/60" />
      <div
        className={`relative flex w-full max-w-xl flex-col rounded-t-3xl border border-b-0 border-[#3A373C] bg-[#141115] shadow-2xl ${expanded ? 'h-[92dvh]' : 'h-[min(78dvh,720px)]'}`}
        style={{
          transform: `translateY(${offset}px)`,
          transition: dragging ? 'none' : 'transform 180ms ease, height 180ms ease',
        }}
      >
        <div
          className="flex shrink-0 cursor-grab touch-none flex-col items-center px-4 pt-2 active:cursor-grabbing"
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
        >
          <span className="h-1 w-10 rounded-full bg-[#3A373C]" />
          <div className="mt-3 flex w-full items-center justify-between">
            <p className="text-[15px] text-white" style={sans}>{title}</p>
            <button type="button" aria-label="Close" onPointerDown={(event) => event.stopPropagation()} onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E1B1F] text-white">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-8 pt-2">
          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
          {view === 'pick' ? (
            <RecordPicker
              embedded
              userId={userId}
              selected={selected}
              selectedWorkoutId={selectedWorkoutId}
              selectedMealId={selectedMealId}
              onSelect={onSelect}
              onLogWorkout={() => setView('workout')}
              onLogMeal={() => setView('meal')}
            />
          ) : null}
          {view === 'workout' ? (
            <LogWorkoutPanel
              onCancel={() => setView('pick')}
              onSaved={(workout) => onSelect({ kind: 'workout', workout })}
            />
          ) : null}
          {view === 'meal' ? (
            <LogMealPanel
              userId={userId}
              onCancel={() => setView('pick')}
              onSaved={(meal) => onSelect({ kind: 'meal', meal })}
              onError={setError}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function RecordPicker({
  embedded = false,
  userId,
  selected,
  selectedWorkoutId,
  selectedMealId,
  onSelect,
  onLogWorkout,
  onLogMeal,
}: {
  embedded?: boolean
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
    <div className={embedded ? '' : 'mt-4 rounded-2xl border border-[#3A373C] bg-[#1E1B1F] p-3'}>
      {embedded ? null : <p className="mb-3 text-center text-[14px] text-white" style={sans}>Attach a record</p>}
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
      <div className={embedded ? 'flex flex-col gap-2' : 'flex max-h-80 flex-col gap-2 overflow-auto'}>
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
  const [values, setValues] = useState<MealFormValues>(EMPTY_MEAL_FORM)
  const [file, setFile] = useState<File | null>(null)
  const [analyzeWithAI, setAnalyzeWithAI] = useState(false)
  const [titleError, setTitleError] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function patchValues(patch: Partial<MealFormValues>) {
    setValues((current) => ({ ...current, ...patch }))
    if (patch.title?.trim()) setTitleError(undefined)
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    const problems = validateMealForm(values)
    if (problems.title) {
      setTitleError(problems.title)
      return
    }
    setSaving(true)
    setError(null)
    onError(null)
    try {
      const { mealId, imageUrl } = await createMeal({ userId, values, photo: file })

      let meal: MealPostRecord = {
        id: mealId,
        title: values.title.trim(),
        calories: parseNullableNumber(values.calories),
        protein: parseNullableNumber(values.protein),
        carbs: parseNullableNumber(values.carbs),
        fat: parseNullableNumber(values.fat),
        meal_type: values.mealType,
        image_url: imageUrl,
        notes: values.notes.trim() || null,
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

      <fieldset disabled={saving} className="min-w-0 space-y-5 border-0 p-0">
        <MealPhotoField
          file={file}
          onChange={(next) => {
            setFile(next)
            if (!next) setAnalyzeWithAI(false)
          }}
          disabled={saving}
        />
        <MealFormFields
          values={values}
          onChange={patchValues}
          titleError={titleError}
          showCarbsFat={false}
          idPrefix="meal"
        />
        <AiAnalysisToggle checked={analyzeWithAI} disabled={!file || saving} onChange={setAnalyzeWithAI} />
      </fieldset>
      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
      <button type="submit" disabled={saving} className="w-full rounded-full bg-[#F5F5F5] py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-[#141115] disabled:opacity-40" style={sans}>
        {saving ? 'Saving…' : 'Save and attach'}
      </button>
    </form>
  )
}
