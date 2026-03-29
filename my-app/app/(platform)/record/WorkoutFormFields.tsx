import { ChangeEvent } from 'react'
import { X } from 'lucide-react'
import { InputDark, TextAreaDark } from '@/app/components/ui/inputs'

export interface WorkoutFormFieldsProps {
  // Scalar field values
  title: string
  loggedDate: string
  duration: string
  workoutLog: string
  isPublic: boolean

  // Scalar field setters
  onTitleChange: (v: string) => void
  onDateChange: (v: string) => void
  onDurationChange: (v: string) => void
  onWorkoutLogChange: (v: string) => void
  onIsPublicChange: (v: boolean) => void

  // Tag input
  workoutTypes: string[]
  typeInput: string
  onTypeInputChange: (v: string) => void
  onTypeKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onTypeBlur: () => void
  onRemoveType: (label: string) => void
  onAddType: (label: string) => void
  previousTypes?: string[]
}

export function WorkoutFormFields({
  title,
  loggedDate,
  duration,
  workoutLog,
  isPublic,
  onTitleChange,
  onDateChange,
  onDurationChange,
  onWorkoutLogChange,
  onIsPublicChange,
  workoutTypes,
  typeInput,
  onTypeInputChange,
  onTypeKeyDown,
  onTypeBlur,
  onRemoveType,
  onAddType,
  previousTypes = [],
}: WorkoutFormFieldsProps) {
  return (
    <>
      <InputDark
        label="Workout Title"
        name="title"
        value={title}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onTitleChange(e.target.value)}
        placeholder="e.g. Push Day, Leg Day"
        required
      />

      <InputDark
        label="Date"
        name="logged_date"
        type="date"
        value={loggedDate}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onDateChange(e.target.value)}
      />

      <InputDark
        label="Duration (minutes)"
        name="duration_minutes"
        type="number"
        value={duration}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onDurationChange(e.target.value)}
        placeholder="e.g. 60"
      />

      {/* Workout Type Labels */}
      <div>
        <p
          className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#6B6870] mb-2"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Workout Type
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {workoutTypes.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-full border border-[#C8F04D] text-[#C8F04D]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {label}
              <button
                type="button"
                onClick={() => onRemoveType(label)}
                className="opacity-60 hover:opacity-100 transition-opacity"
                aria-label={`Remove ${label}`}
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={typeInput}
          onChange={(e) => onTypeInputChange(e.target.value)}
          onKeyDown={onTypeKeyDown}
          onBlur={onTypeBlur}
          placeholder="e.g. Strength, Cardio, Outdoor — press Enter to add"
          className="w-full bg-transparent border-b-2 border-[#3A373C] focus:border-[#C8F04D] outline-none text-white text-[14px] pb-2 placeholder-[#3A373C] transition-colors duration-150"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        />
        <p
          className="text-[11px] text-[#6B6870] mt-1"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Press Enter or comma to add a label. You can create any label you want.
        </p>
        {previousTypes.filter((t) => !workoutTypes.includes(t)).length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className="text-[11px] text-[#6B6870] shrink-0"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Your labels:
            </span>
            {previousTypes
              .filter((t) => !workoutTypes.includes(t))
              .map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onAddType(label)}
                  className="px-3 py-1 text-[11px] font-medium rounded-full border border-[#3A373C] text-[#A09EA3] hover:border-[#C8F04D] hover:text-[#C8F04D] transition-colors duration-150"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {label}
                </button>
              ))}
          </div>
        )}
      </div>

      <TextAreaDark
        label="Workout Log"
        name="workout_log"
        value={workoutLog}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onWorkoutLogChange(e.target.value)}
        placeholder={`Squat 4x8 @ 100kg\nBench Press 3x10 @ 80kg\nDeadlift 3x5 @ 140kg`}
        rows={8}
      />

      {/* Public toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          onClick={() => onIsPublicChange(!isPublic)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
            isPublic ? 'bg-[#C8F04D]' : 'bg-[#3A373C]'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-[#141115] shadow transition-transform duration-200 ${
              isPublic ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
        <span
          className="text-[13px] text-[#6B6870]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {isPublic ? 'Visible to the community' : 'Private — only you can see this'}
        </span>
      </div>
    </>
  )
}