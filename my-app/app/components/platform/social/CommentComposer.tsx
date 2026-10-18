'use client'

import { useEffect, useState } from 'react'
import { ImagePlus, Plus, X } from 'lucide-react'
import { RecordSheet } from '@/app/components/platform/social/CreatePostForm'
import { MealPostCard } from '@/app/components/platform/social/MealPostCard'
import { StatusMessage } from '@/app/components/platform/social/StatusMessage'
import { WorkoutAttachmentCard } from '@/app/components/platform/social/WorkoutAttachmentCard'
import {
  createSocialComment,
  fetchCurrentProfile,
  uploadImages,
  type EnrichedComment,
} from '@/lib/social/browser'
import { displayName, sans } from '@/lib/social/format'
import {
  POST_TYPE,
  serializeCommentRecordsPayload,
  type MealPostRecord,
  type WorkoutPostRecord,
} from '@/lib/social/post-content'

const MAX_NOTE = 280
const MAX_MEDIA = 3
const MAX_STORED = 5000

type MediaKind = 'image' | 'video'

type CommentInput = {
  content: string
  parentCommentId?: string | null
  images?: string[]
  videos?: string[]
  contentType?: string
}

export function CommentComposer({
  postId,
  replyTo,
  onCancelReply,
  onCreated,
  submitComment,
  allowRecords = true,
  placeholder,
}: {
  postId: string
  submitComment?: (input: CommentInput) => Promise<EnrichedComment>
  allowRecords?: boolean
  placeholder?: string
  replyTo: EnrichedComment | null
  onCancelReply: () => void
  onCreated: (comment: EnrichedComment, parent: EnrichedComment | null) => void
}) {
  const [userId, setUserId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [videoFiles, setVideoFiles] = useState<File[]>([])
  const [videoPreviews, setVideoPreviews] = useState<string[]>([])
  const [meal, setMeal] = useState<MealPostRecord | null>(null)
  const [workout, setWorkout] = useState<WorkoutPostRecord | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchCurrentProfile().then((current) => {
      if (!cancelled && current) setUserId(current.userId)
    }).catch(() => {
      if (!cancelled) setError('Could not load your profile.')
    })
    return () => {
      cancelled = true
    }
  }, [])

  function resetAttachments() {
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview))
    videoPreviews.forEach((preview) => URL.revokeObjectURL(preview))
    setImageFiles([])
    setImagePreviews([])
    setVideoFiles([])
    setVideoPreviews([])
    setMeal(null)
    setWorkout(null)
    setSheetOpen(false)
  }

  function addMedia(list: FileList | null) {
    if (!list?.length) return
    const incoming = Array.from(list)
    const incomingImages = incoming.filter((file) => file.type.startsWith('image/'))
    const incomingVideos = incoming.filter((file) => file.type.startsWith('video/'))
    if (incomingImages.length + incomingVideos.length !== incoming.length) {
      setError('Choose photos or videos.')
      return
    }
    if (
      (incomingImages.length > 0 && (videoFiles.length > 0 || incomingVideos.length > 0))
      || (incomingVideos.length > 0 && (imageFiles.length > 0 || incomingImages.length > 0))
    ) {
      setError('A comment can include images or videos, not both.')
      return
    }
    if (incomingImages.length && imageFiles.length + incomingImages.length > MAX_MEDIA) {
      setError('A comment can have at most 3 images.')
      return
    }
    if (incomingVideos.length && videoFiles.length + incomingVideos.length > MAX_MEDIA) {
      setError('A comment can have at most 3 videos.')
      return
    }
    if (incomingImages.length) {
      setImageFiles((files) => [...files, ...incomingImages])
      setImagePreviews((urls) => [...urls, ...incomingImages.map((file) => URL.createObjectURL(file))])
    }
    if (incomingVideos.length) {
      setVideoFiles((files) => [...files, ...incomingVideos])
      setVideoPreviews((urls) => [...urls, ...incomingVideos.map((file) => URL.createObjectURL(file))])
    }
    setError(null)
  }

  function removeMedia(kind: MediaKind, index: number) {
    if (kind === 'image') {
      URL.revokeObjectURL(imagePreviews[index])
      setImageFiles((files) => files.filter((_, itemIndex) => itemIndex !== index))
      setImagePreviews((urls) => urls.filter((_, itemIndex) => itemIndex !== index))
    } else {
      URL.revokeObjectURL(videoPreviews[index])
      setVideoFiles((files) => files.filter((_, itemIndex) => itemIndex !== index))
      setVideoPreviews((urls) => urls.filter((_, itemIndex) => itemIndex !== index))
    }
  }

  const canSubmit = Boolean(draft.trim() || imageFiles.length || videoFiles.length || meal || workout) && !submitting

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit || submitting) return
    if (imageFiles.length > 0 && videoFiles.length > 0) {
      setError('A comment can include images or videos, not both.')
      return
    }
    if (imageFiles.length > MAX_MEDIA) {
      setError('A comment can have at most 3 images.')
      return
    }
    if (videoFiles.length > MAX_MEDIA) {
      setError('A comment can have at most 3 videos.')
      return
    }
    if ((imageFiles.length > 0 || videoFiles.length > 0) && !userId) {
      setError('You need to be logged in to attach media.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const images = imageFiles.length && userId
        ? await uploadImages('post_images', userId, imageFiles)
        : { urls: [], error: null }
      if (images.error) {
        setError(images.error)
        setSubmitting(false)
        return
      }
      const videos = videoFiles.length && userId
        ? await uploadImages('post_images', userId, videoFiles)
        : { urls: [], error: null }
      if (videos.error) {
        setError(videos.error)
        setSubmitting(false)
        return
      }

      const note = draft.trim()
      const hasRecords = Boolean(meal || workout)
      const content = hasRecords
        ? serializeCommentRecordsPayload({
            version: 1,
            kind: 'comment_records',
            userText: note,
            meal,
            workout,
          })
        : note
      if (content.length > MAX_STORED) {
        setError('This reply is too long to publish. Shorten the note or the attached log.')
        setSubmitting(false)
        return
      }

      const created = await (submitComment ?? ((input: CommentInput) => createSocialComment(postId, input)))({
        content,
        parentCommentId: replyTo?.id ?? null,
        images: images.urls,
        videos: videos.urls,
        contentType: hasRecords ? POST_TYPE.COMMENT_RECORDS : POST_TYPE.NORMAL_POST,
      })
      onCreated(created, replyTo)
      setDraft('')
      resetAttachments()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not post comment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit}>
        {replyTo ? (
          <div className="mb-3 flex items-center justify-between gap-3 text-[12px] text-[#A09EA3]" style={sans}>
            <span className="truncate">Replying to {displayName(replyTo.profile, replyTo.authorId)}</span>
            <button type="button" onClick={onCancelReply} className="uppercase tracking-[0.12em]">Cancel</button>
          </div>
        ) : null}
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value.slice(0, MAX_NOTE))}
          placeholder={replyTo ? 'Write a reply' : (placeholder ?? 'Write a comment')}
          rows={3}
          maxLength={MAX_NOTE}
          className="w-full resize-none rounded-2xl bg-[#1E1B1F] px-4 py-3 text-[14px] text-white outline-none placeholder:text-[#6B6870]"
          style={sans}
        />

        {imagePreviews.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {imagePreviews.map((preview, index) => (
              <div key={preview} className="relative aspect-square overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img data-testid="comment-image-preview" src={preview} alt="" className="h-full w-full object-cover" />
                <RemoveButton label="Remove image" onClick={() => removeMedia('image', index)} />
              </div>
            ))}
          </div>
        )}
        {videoPreviews.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {videoPreviews.map((preview, index) => (
              <div key={preview} className="relative overflow-hidden rounded-xl bg-black">
                <video data-testid="comment-video-preview" src={preview} className="aspect-video w-full" muted />
                <RemoveButton label="Remove video" onClick={() => removeMedia('video', index)} />
              </div>
            ))}
          </div>
        )}
        {workout ? (
          <div className="relative mt-3">
            <WorkoutAttachmentCard workout={workout} />
            <RemoveButton label="Remove workout" onClick={() => setWorkout(null)} />
          </div>
        ) : null}
        {meal ? (
          <div className="relative mt-3">
            <MealPostCard meal={meal} />
            <RemoveButton label="Remove meal" onClick={() => setMeal(null)} />
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-3 text-[12px] uppercase tracking-[0.12em] text-white ${submitting ? 'pointer-events-none opacity-40' : ''}`} style={sans}>
            <ImagePlus size={16} />
            Media
            <input
              aria-label="Comment media"
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(event) => {
                addMedia(event.target.files)
                event.target.value = ''
              }}
            />
          </label>
          {allowRecords ? <button
            type="button"
            onClick={() => setSheetOpen(true)}
            disabled={submitting || !userId}
            className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-[12px] uppercase tracking-[0.12em] text-white disabled:opacity-40"
            style={sans}
          >
            <Plus size={16} />
            Record
          </button> : null}
          <span className="ml-auto text-[12px] text-[#6B6870]" style={sans}>{draft.length}/{MAX_NOTE}</span>
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-full bg-[#F5F5F5] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#141115] disabled:opacity-40"
            style={sans}
          >
            {submitting ? 'Posting…' : 'Reply'}
          </button>
        </div>
        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
      </form>

      {sheetOpen && userId ? (
        <RecordSheet
          userId={userId}
          selectedWorkoutId={workout?.id ?? null}
          selectedMealId={meal?.id ?? null}
          onClose={() => setSheetOpen(false)}
          onSelect={(attachment) => {
            if (attachment.kind === 'workout') setWorkout(attachment.workout)
            else setMeal(attachment.meal)
            setSheetOpen(false)
            setError(null)
          }}
        />
      ) : null}
    </div>
  )
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
    >
      <X size={12} />
    </button>
  )
}
