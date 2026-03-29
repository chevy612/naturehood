'use client'

import { SuccessModal } from '@/app/components/ui/notification'
import { useWorkoutTypes } from './useWorkoutTypes'
import { useWorkoutForm } from './useWorkoutForm'
import { WorkoutFormFields } from './WorkoutFormFields'

const DRAFT_KEY = 'naturehood_draft_workout'

// Read initial workout types from draft synchronously (client-only, first render only)
function getDraftWorkoutTypes(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (raw) return JSON.parse(raw).workoutTypes ?? []
  } catch {}
  return []
}

export default function RecordForm({ previousTypes = [] }: { previousTypes?: string[] }) {
  const types = useWorkoutTypes(getDraftWorkoutTypes())
  const form = useWorkoutForm(types.workoutTypes)

  return (
    <>
      {form.draftRestored && (
        <p
          className="text-[12px] text-[#A09EA3] mb-4"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Draft restored — your unsaved workout was recovered.
        </p>
      )}

      <form
        onSubmit={(e) => {
          types.commitPendingType()
          form.handleSubmit(e, types.workoutTypes)
        }}
        className="space-y-6"
      >
        <WorkoutFormFields
          title={form.fields.title}
          loggedDate={form.fields.loggedDate}
          duration={form.fields.duration}
          workoutLog={form.fields.workoutLog}
          isPublic={form.fields.isPublic}
          onTitleChange={(v) => { form.setTitle(v); form.clearError() }}
          onDateChange={form.setLoggedDate}
          onDurationChange={form.setDuration}
          onWorkoutLogChange={form.setWorkoutLog}
          onIsPublicChange={form.setIsPublic}
          workoutTypes={types.workoutTypes}
          typeInput={types.typeInput}
          onTypeInputChange={types.setTypeInput}
          onTypeKeyDown={types.handleTypeKeyDown}
          onTypeBlur={types.handleTypeBlur}
          onRemoveType={types.removeType}
          onAddType={types.addWorkoutType}
          previousTypes={previousTypes}
        />

        {form.error && (
          <p
            className="text-[13px] text-[#FF4D4D]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {form.error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={form.submitting || form.aiSubmitting}
            className="flex-1 bg-[#C8F04D] text-[#141115] px-8 py-4 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#b8e038] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {form.submitting ? 'Saving…' : 'Log Workout'}
          </button>
          <button
            type="button"
            onClick={() => form.handleLogWithAI(types.workoutTypes, types.commitPendingType)}
            disabled={form.submitting || form.aiSubmitting}
            className="flex-1 border border-[#C8F04D] text-[#C8F04D] px-8 py-4 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#C8F04D]/10 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {form.aiSubmitting ? 'Analyzing…' : 'Log with AI'}
          </button>
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
          onClose={() => form.handleSuccessClose(types.reset)}
        />
      )}
    </>
  )
}
