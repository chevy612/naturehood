'use client'

import { ChangeEvent, useState, useSyncExternalStore } from 'react'
import { CalendarDays, Check, Plus } from 'lucide-react'
import { InputDark, SwitchDark } from '@/app/components/ui/inputs'
import { shiftDateKey, todayDateKey } from '@/lib/meals/utils'

// ─────────────────────────────────────────────
// WORKOUT FORM FIELDS
//   Tap-first building blocks shared by Log, Edit and the Create-post workout attachment.
//   Mirrors naturehood-mobile `WorkoutThread`: title · date · duration · type · notes.
//   `WorkoutFormFields` stacks them; the Log page arranges them in its own responsive layout.
// ─────────────────────────────────────────────

const sans = { fontFamily: "'DM Sans', sans-serif" }

/** Shown when the athlete has no labels of their own yet. */
const STARTER_TYPES = ['Strength', 'Sprint', 'Conditioning', 'Mobility', 'Recovery']
const DURATION_PRESETS = [30, 45, 60, 90]
const VISIBLE_TYPE_SUGGESTIONS = 8

export function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="nh-label mb-2 block !text-[11px] !text-[#6B6870]">
      {children}
    </label>
  )
}

function Chip({
  active,
  onClick,
  children,
  ariaLabel,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-colors ${
        active
          ? 'border-[#F5F5F5] bg-[#F5F5F5] text-[#141115]'
          : 'border-[#3D3940] bg-transparent text-[#A09EA3] hover:border-[#6B6870] hover:text-white'
      }`}
      style={sans}
    >
      {children}
    </button>
  )
}

function formatShortDate(key: string): string {
  const date = new Date(`${key}T12:00`)
  if (Number.isNaN(date.getTime())) return key
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

// ── Date ──────────────────────────────────────

const noopSubscribe = () => () => {}

export function DateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // Null while server-rendering (Edit, Create post): the server's UTC day can differ from the
  // viewer's, so Today/Yesterday only light up once the browser's date is known.
  const today = useSyncExternalStore(noopSubscribe, todayDateKey, () => null)
  const yesterday = today ? shiftDateKey(today, -1) : null
  const isOther = value !== today && value !== yesterday

  return (
    <div>
      <FieldLabel>Date</FieldLabel>
      <div className="flex flex-wrap gap-2">
        <Chip active={value === today} onClick={() => onChange(today ?? todayDateKey())}>Today</Chip>
        <Chip active={value === yesterday} onClick={() => onChange(yesterday ?? shiftDateKey(todayDateKey(), -1))}>
          Yesterday
        </Chip>
        {/* Native picker under a chip: the OS calendar on phones, the browser one on desktop. */}
        <label
          className={`relative inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-colors focus-within:ring-1 focus-within:ring-white/40 ${
            isOther
              ? 'border-[#F5F5F5] bg-[#F5F5F5] text-[#141115]'
              : 'border-[#3D3940] text-[#A09EA3] hover:border-[#6B6870] hover:text-white'
          }`}
          style={sans}
        >
          <CalendarDays size={14} />
          {isOther ? formatShortDate(value) : 'Pick date'}
          <input
            type="date"
            name="logged_date"
            value={value}
            max={today ?? undefined}
            onChange={(e) => e.target.value && onChange(e.target.value)}
            onClick={(e) => e.currentTarget.showPicker?.()}
            aria-label="Workout date"
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
      </div>
    </div>
  )
}

// ── Duration ──────────────────────────────────

export function DurationField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // The free-entry box only echoes values the chips don't already show.
  const isPreset = DURATION_PRESETS.some((mins) => String(mins) === value)
  return (
    <div>
      <FieldLabel htmlFor="duration_minutes">Duration</FieldLabel>
      <div className="flex flex-wrap items-center gap-2">
        {DURATION_PRESETS.map((mins) => (
          <Chip
            key={mins}
            active={value === String(mins)}
            onClick={() => onChange(value === String(mins) ? '' : String(mins))}
            ariaLabel={`${mins} minutes`}
          >
            {mins}
          </Chip>
        ))}
        <span
          className={`inline-flex h-9 items-center gap-1 rounded-full border pl-3.5 pr-3 focus-within:border-[#F5F5F5] ${
            value && !isPreset ? 'border-[#F5F5F5]' : 'border-[#3D3940]'
          }`}
        >
          <input
            id="duration_minutes"
            name="duration_minutes"
            inputMode="numeric"
            value={isPreset ? '' : value}
            onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="Other"
            className="w-11 bg-transparent text-[13px] text-white outline-none placeholder:text-[#6B6870]"
            style={sans}
          />
          <span className="text-[12px] text-[#6B6870]" style={sans}>min</span>
        </span>
      </div>
    </div>
  )
}

// ── Type ──────────────────────────────────────

export function TypeField({
  workoutTypes,
  typeInput,
  onTypeInputChange,
  onTypeKeyDown,
  onTypeBlur,
  onRemoveType,
  onAddType,
  previousTypes = [],
}: {
  workoutTypes: string[]
  typeInput: string
  onTypeInputChange: (v: string) => void
  onTypeKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onTypeBlur: () => void
  onRemoveType: (label: string) => void
  onAddType: (label: string) => void
  previousTypes?: string[]
}) {
  const [showAll, setShowAll] = useState(false)
  const suggestions = previousTypes.length ? previousTypes : STARTER_TYPES
  // Selected labels first, so they stay visible when the list is collapsed.
  const options = Array.from(new Set([...workoutTypes, ...suggestions]))
  const hidden = Math.max(0, options.length - VISIBLE_TYPE_SUGGESTIONS)
  const visible = showAll ? options : options.slice(0, VISIBLE_TYPE_SUGGESTIONS)

  return (
    <div>
      <FieldLabel htmlFor="workout_type_input">Type</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {visible.map((label) => {
          const active = workoutTypes.includes(label)
          return (
            <Chip key={label} active={active} onClick={() => (active ? onRemoveType(label) : onAddType(label))}>
              {active ? <Check size={13} /> : null}
              {label}
            </Chip>
          )
        })}
        {hidden > 0 ? (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="h-9 px-2 text-[12px] font-semibold text-[#847E89] hover:text-white"
            style={sans}
          >
            {showAll ? 'Show less' : `+${hidden} more`}
          </button>
        ) : null}
      </div>
      <span className="mt-2 flex h-9 items-center gap-1.5 rounded-full border border-dashed border-[#3D3940] px-3.5 focus-within:border-solid focus-within:border-[#F5F5F5] sm:max-w-[260px]">
        <Plus size={14} className="shrink-0 text-[#6B6870]" />
        <input
          id="workout_type_input"
          type="text"
          value={typeInput}
          onChange={(e) => onTypeInputChange(e.target.value)}
          onKeyDown={onTypeKeyDown}
          onBlur={onTypeBlur}
          placeholder="New label, press Enter"
          className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-[#6B6870]"
          style={sans}
        />
      </span>
    </div>
  )
}

// ── Notes ─────────────────────────────────────

export function NotesField({
  value,
  onChange,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  className?: string
}) {
  return (
    <div className="flex flex-col">
      <FieldLabel htmlFor="workout_log">Notes</FieldLabel>
      <textarea
        id="workout_log"
        name="workout_log"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Squat 4x8 @ 100kg\nBench Press 3x10 @ 80kg\n6 x 60m sprints, full recovery\nFelt strong, left hamstring a bit tight`}
        className={`field-sizing-content min-h-[200px] w-full resize-none rounded-2xl bg-[#1E1B1F] px-4 py-3.5 text-[15px] leading-relaxed text-white outline-none transition-shadow placeholder:text-[#4A464C] focus:ring-1 focus:ring-white/20 ${className}`}
        style={sans}
      />
      <p className="mt-2 text-[12px] text-[#6B6870]" style={sans}>
        Write it however you like — sets, reps, times, how you felt. We&apos;ll structure it for you.
      </p>
    </div>
  )
}

// ── Stacked form (Edit · Create post) ─────────

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
  showVisibility?: boolean
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
  showVisibility = true,
}: WorkoutFormFieldsProps) {
  return (
    <>
      <InputDark
        label="Workout Title"
        name="title"
        value={title}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onTitleChange(e.target.value)}
        placeholder="e.g. Push Day, Leg Day"
        maxLength={100}
        required
      />

      <DateField value={loggedDate} onChange={onDateChange} />
      <DurationField value={duration} onChange={onDurationChange} />
      <TypeField
        workoutTypes={workoutTypes}
        typeInput={typeInput}
        onTypeInputChange={onTypeInputChange}
        onTypeKeyDown={onTypeKeyDown}
        onTypeBlur={onTypeBlur}
        onRemoveType={onRemoveType}
        onAddType={onAddType}
        previousTypes={previousTypes}
      />
      <NotesField value={workoutLog} onChange={onWorkoutLogChange} />

      {showVisibility && (
        <SwitchDark
          checked={isPublic}
          onChange={onIsPublicChange}
          label={isPublic ? 'Visible to the community' : 'Private — only you can see this'}
        />
      )}
    </>
  )
}
