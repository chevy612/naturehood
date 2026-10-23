'use client'

import { useSyncExternalStore } from 'react'
import { Globe, Lock } from 'lucide-react'
import { SuccessModal } from '@/app/components/ui/notification'
import { useWorkoutTypes } from './useWorkoutTypes'
import { useWorkoutForm } from './useWorkoutForm'
import { DateField, DurationField, NotesField, TypeField } from './WorkoutFormFields'

// ─────────────────────────────────────────────
// LOG WORKOUT
//   Mirrors naturehood-mobile `record/log.tsx`: one Log action, AI runs silently after save.
//   Phone: single column (title · date · duration · type · notes) with a bottom action bar
//   above the BottomNav. Desktop: title + notes on the left, a sticky details panel on the right.
// ─────────────────────────────────────────────

const DRAFT_KEY = 'naturehood_draft_workout'
const sans = { fontFamily: "'DM Sans', sans-serif" }

// Read initial workout types from draft synchronously (client-only, first render only)
function getDraftWorkoutTypes(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (raw) return JSON.parse(raw).workoutTypes ?? []
  } catch {}
  return []
}

const noopSubscribe = () => () => {}

/**
 * The form reads the local date and the localStorage draft on its first render, so it only
 * renders in the browser — the server (often UTC) would otherwise disagree about "today".
 */
export default function RecordForm({ previousTypes = [] }: { previousTypes?: string[] }) {
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false)
  if (!isClient) return <RecordFormSkeleton />
  return <RecordFormBody previousTypes={previousTypes} />
}

function RecordFormSkeleton() {
  return (
    <div className="grid animate-pulse gap-4 md:grid-cols-[minmax(0,1fr)_320px]" aria-busy="true" aria-label="Loading form">
      <div className="h-[360px] rounded-2xl bg-[#1E1B1F]" />
      <div className="hidden h-[360px] rounded-2xl bg-[#1E1B1F] md:block" />
    </div>
  )
}

function RecordFormBody({ previousTypes }: { previousTypes: string[] }) {
  const types = useWorkoutTypes(getDraftWorkoutTypes())
  const form = useWorkoutForm(types.workoutTypes)
  const { title, loggedDate, duration, workoutLog, isPublic } = form.fields

  const logLabel = form.submitting ? 'Saving…' : 'Log workout'
  const shortcut = /Mac|iP(hone|ad|od)/.test(navigator.platform) ? '⌘↵' : 'Ctrl↵'

  return (
    <>
      {form.draftRestored && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-[#1E1B1F] px-4 py-2.5">
          <p className="text-[13px] text-[#A09EA3]" style={sans}>Draft restored — picking up where you left off.</p>
          <button
            type="button"
            onClick={() => form.handleSuccessClose(types.reset)}
            className="shrink-0 text-[12px] font-semibold text-[#847E89] hover:text-white"
            style={sans}
          >
            Discard
          </button>
        </div>
      )}

      <form
        onSubmit={(e) => {
          types.commitPendingType()
          form.handleSubmit(e, types.workoutTypes)
        }}
        onKeyDown={(e) => {
          // ⌘/Ctrl + Enter logs from anywhere in the form (desktop power-user shortcut).
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            e.currentTarget.requestSubmit()
          }
        }}
        className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px] md:grid-rows-[auto_1fr] md:items-start"
      >
        {/* Title */}
        <section className="rounded-2xl bg-[#1E1B1F] p-4 md:col-start-1 md:row-start-1 md:p-5">
          <label htmlFor="title" className="nh-label mb-2 block !text-[11px] !text-[#6B6870]">Title</label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(e) => { form.setTitle(e.target.value.slice(0, 100)); form.clearError() }}
            placeholder="What did you train?"
            maxLength={100}
            required
            autoComplete="off"
            className="w-full bg-transparent text-[22px] font-bold leading-tight text-white outline-none placeholder:text-[#4A464C] md:text-[26px]"
            style={{ fontFamily: "'Sk Modernist', sans-serif", letterSpacing: '-0.01em' }}
          />
        </section>

        {/* Details — right rail on desktop, inline on phones */}
        <aside className="flex flex-col gap-5 rounded-2xl bg-[#1E1B1F] p-4 md:sticky md:top-6 md:col-start-2 md:row-span-2 md:row-start-1 md:p-5">
          <DateField value={loggedDate} onChange={form.setLoggedDate} />
          <DurationField value={duration} onChange={form.setDuration} />
          <TypeField
            workoutTypes={types.workoutTypes}
            typeInput={types.typeInput}
            onTypeInputChange={types.setTypeInput}
            onTypeKeyDown={types.handleTypeKeyDown}
            onTypeBlur={types.handleTypeBlur}
            onRemoveType={types.removeType}
            onAddType={types.addWorkoutType}
            previousTypes={previousTypes}
          />

          {/* Desktop actions */}
          <div className="hidden flex-col gap-3 border-t border-[#2B282C] pt-4 md:flex">
            <VisibilityToggle isPublic={isPublic} onChange={form.setIsPublic} />
            {form.error ? <ErrorText>{form.error}</ErrorText> : null}
            <button
              type="submit"
              disabled={form.submitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#F5F5F5] text-[14px] font-semibold text-[#141115] transition-opacity hover:opacity-90 disabled:opacity-50"
              style={sans}
            >
              {logLabel}
              {!form.submitting ? <kbd className="text-[11px] font-normal text-[#6B6870]">{shortcut}</kbd> : null}
            </button>
          </div>
        </aside>

        {/* Notes */}
        <section className="rounded-2xl bg-[#1E1B1F] p-4 md:col-start-1 md:row-start-2 md:p-5">
          <NotesField value={workoutLog} onChange={form.setWorkoutLog} className="md:min-h-[320px]" />
        </section>

        {/* Phone action bar — sits above the BottomNav (h-14) */}
        <div className="fixed inset-x-0 bottom-14 z-40 border-t border-[#2B282C] bg-[#141115]/95 px-4 py-2.5 backdrop-blur md:hidden">
          {form.error ? <div className="mb-2"><ErrorText>{form.error}</ErrorText></div> : null}
          <div className="flex items-center gap-3">
            <VisibilityToggle isPublic={isPublic} onChange={form.setIsPublic} compact />
            <button
              type="submit"
              disabled={form.submitting}
              className="ml-auto h-11 rounded-full bg-[#F5F5F5] px-6 text-[14px] font-semibold text-[#141115] transition-opacity active:opacity-80 disabled:opacity-50"
              style={sans}
            >
              {logLabel}
            </button>
          </div>
        </div>
      </form>

      {form.showSuccess && (
        <SuccessModal
          variant="dark"
          title="Workout logged!"
          message={
            form.aiFormatting
              ? 'Saved. AI is structuring your workout log…'
              : 'Your workout has been saved. Keep it up.'
          }
          actionHref={form.shareHref ?? undefined}
          actionLabel={form.shareHref ? 'Share to feed' : undefined}
          onClose={() => form.handleSuccessClose(types.reset)}
        />
      )}
    </>
  )
}

function VisibilityToggle({
  isPublic,
  onChange,
  compact = false,
}: {
  isPublic: boolean
  onChange: (v: boolean) => void
  compact?: boolean
}) {
  const Icon = isPublic ? Globe : Lock
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isPublic}
      onClick={() => onChange(!isPublic)}
      className={`flex items-center gap-2 rounded-full text-left transition-colors ${
        compact ? 'h-11 px-1' : 'w-full bg-[#181519] px-4 py-3 hover:bg-[#221F23]'
      }`}
      style={sans}
    >
      <Icon size={compact ? 20 : 16} className={isPublic ? 'text-white' : 'text-[#6B6870]'} />
      <span className="flex flex-col">
        <span className={`text-[13px] font-semibold ${isPublic ? 'text-white' : 'text-[#A09EA3]'}`}>
          {isPublic ? 'Public' : 'Private'}
        </span>
        {!compact ? (
          <span className="text-[11px] text-[#6B6870]">
            {isPublic ? 'Visible to the community · tap to make private' : 'Only you can see this · tap to share'}
          </span>
        ) : null}
      </span>
    </button>
  )
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] text-[#FF4D4D]" style={sans} role="alert">{children}</p>
}
