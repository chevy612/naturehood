import type { WorkoutPostRecord } from '@/lib/social/post-content'
import { formatShortDate, sans, display } from '@/lib/social/format'
import { PillTag } from '@/app/components/ui/tags'

export function WorkoutAttachmentCard({ workout, expanded = false }: { workout: WorkoutPostRecord; expanded?: boolean }) {
  const meta = [
    formatShortDate(workout.logged_date),
    workout.duration_minutes ? `${workout.duration_minutes} min` : null,
  ].filter(Boolean).join(' · ')

  return (
    <div className="rounded-2xl border border-[#3A373C] bg-[#1E1B1F] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A09EA3]" style={display}>
        Workout
      </p>
      <p className="mt-1 text-[15px] text-white" style={sans}>{workout.title}</p>
      {meta ? (
        <p className="mt-1 text-[12px] text-[#6B6870]" style={sans}>{meta}</p>
      ) : null}
      {workout.workout_types.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {workout.workout_types.map((type) => (
            <PillTag key={type} label={type} variant="ghost-green" size="sm" />
          ))}
        </div>
      )}
      {workout.workout_log ? (
        <p className={`mt-2 ${expanded ? '' : 'line-clamp-3'} whitespace-pre-wrap text-[13px] text-[#A09EA3]`} style={sans}>
          {workout.workout_log}
        </p>
      ) : null}
    </div>
  )
}
