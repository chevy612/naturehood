'use client'

import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { SessionBlockRow, SessionExerciseRow, ExerciseSetRow, BlockType } from '@/lib/types'

// ── Types used locally for draft state ───────────────────────────────────────

export type DraftSet = Omit<ExerciseSetRow, 'id' | 'exercise_id' | 'training_log_id' | 'user_id'>
export type DraftExercise = Omit<SessionExerciseRow, 'id' | 'training_log_id' | 'user_id' | 'block_id'> & {
  sets: DraftSet[]
}
export type DraftBlock = Omit<SessionBlockRow, 'id' | 'training_log_id' | 'user_id'> & {
  exercises: DraftExercise[]
}

function blankSet(set_index: number): DraftSet {
  return {
    set_index,
    is_warmup: false,
    is_failure: false,
    is_dropset: false,
    weight_kg: null,
    weight_type: null,
    weight_value_raw: null,
    added_weight_kg: null,
    machine_level: null,
    reps: null,
    reps_left: null,
    reps_right: null,
    duration_seconds: null,
    distance_m: null,
    pace_seconds_per_km: null,
    time_seconds: null,
    splits_seconds: null,
    effort_percent: null,
    rest_seconds: null,
    rest_between_reps_seconds: null,
    notes: null,
  }
}

function blankExercise(exercise_index: number): DraftExercise {
  return {
    exercise_index,
    name: '',
    name_original: null,
    name_unknown: false,
    category: null,
    equipment: null,
    laterality: null,
    is_superset_with: null,
    notes: null,
    total_volume_kg: null,
    max_weight_kg: null,
    total_reps: null,
    set_count: null,
    sets: [blankSet(0)],
  }
}

function blankBlock(block_index: number): DraftBlock {
  return {
    block_index,
    block_name: null,
    block_type: 'main',
    emom_interval_seconds: null,
    circuit_rounds: null,
    intensity_percent: null,
    notes: null,
    exercises: [blankExercise(0)],
  }
}

const BLOCK_TYPES: { value: BlockType; label: string }[] = [
  { value: 'warmup',   label: 'Warm-up' },
  { value: 'main',     label: 'Main' },
  { value: 'cooldown', label: 'Cool-down' },
  { value: 'circuit',  label: 'Circuit' },
  { value: 'emom',     label: 'EMOM' },
  { value: 'amrap',    label: 'AMRAP' },
  { value: 'superset', label: 'Superset' },
]

// ── Set row ───────────────────────────────────────────────────────────────────

function SetRow({
  set,
  onChange,
  onDelete,
}: {
  set: DraftSet
  onChange: (patch: Partial<DraftSet>) => void
  onDelete: () => void
}) {
  const num = (val: string) => (val === '' ? null : isNaN(Number(val)) ? null : Number(val))

  return (
    <div className="flex items-center gap-2 py-1.5 border-t border-[#2A272C]">
      <span className="text-[11px] text-[#6B6870] w-5 shrink-0 text-right" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {set.set_index + 1}
      </span>

      {/* Flags */}
      <div className="flex gap-1">
        {(['is_warmup', 'is_failure', 'is_dropset'] as const).map((flag) => (
          <button
            key={flag}
            type="button"
            onClick={() => onChange({ [flag]: !set[flag] })}
            className={`px-1.5 py-0.5 text-[9px] font-bold uppercase border transition-colors ${
              set[flag]
                ? 'bg-[#C8F04D] border-[#C8F04D] text-[#141115]'
                : 'border-[#3A373C] text-[#3A373C] hover:border-[#6B6870]'
            }`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {flag === 'is_warmup' ? 'WU' : flag === 'is_failure' ? 'F' : 'D'}
          </button>
        ))}
      </div>

      {/* Weight */}
      <input
        type="number"
        step="0.5"
        value={set.weight_kg ?? ''}
        placeholder="kg"
        onChange={(e) => onChange({ weight_kg: num(e.target.value) })}
        className="w-16 bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-[12px] text-white px-2 py-1 transition-colors"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />

      {/* Reps */}
      <input
        type="number"
        value={set.reps ?? ''}
        placeholder="reps"
        onChange={(e) => onChange({ reps: num(e.target.value) as number | null })}
        className="w-14 bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-[12px] text-white px-2 py-1 transition-colors"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />

      {/* Effort % */}
      <input
        type="number"
        min={0}
        max={100}
        value={set.effort_percent ?? ''}
        placeholder="%"
        onChange={(e) => onChange({ effort_percent: num(e.target.value) as number | null })}
        className="w-12 bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-[12px] text-white px-2 py-1 transition-colors"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />

      {/* Notes */}
      <input
        type="text"
        value={set.notes ?? ''}
        placeholder="note"
        onChange={(e) => onChange({ notes: e.target.value || null })}
        className="flex-1 bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-[12px] text-white px-2 py-1 transition-colors min-w-0"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />

      <button
        type="button"
        onClick={onDelete}
        className="text-[#3A373C] hover:text-[#FF4D4D] transition-colors shrink-0"
        aria-label="Remove set"
      >
        <X size={12} />
      </button>
    </div>
  )
}

// ── Exercise card ─────────────────────────────────────────────────────────────

function ExerciseCard({
  exercise,
  onChange,
  onDelete,
}: {
  exercise: DraftExercise
  onChange: (patch: Partial<DraftExercise>) => void
  onDelete: () => void
}) {
  const [collapsed, setCollapsed] = useState(false)

  const updateSet = (i: number, patch: Partial<DraftSet>) =>
    onChange({ sets: exercise.sets.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) })

  const deleteSet = (i: number) =>
    onChange({ sets: exercise.sets.filter((_, idx) => idx !== i) })

  const addSet = () =>
    onChange({ sets: [...exercise.sets, blankSet(exercise.sets.length)] })

  return (
    <div className="border border-[#3A373C] bg-[#1A1719]">
      {/* Exercise header */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <input
          type="text"
          value={exercise.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Exercise name"
          className="flex-1 bg-transparent outline-none text-[13px] font-semibold text-white placeholder-[#3A373C]"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em' }}
        />
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="text-[#6B6870] hover:text-white transition-colors shrink-0"
          aria-label={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-[#3A373C] hover:text-[#FF4D4D] transition-colors shrink-0"
          aria-label="Remove exercise"
        >
          <X size={14} />
        </button>
      </div>

      {!collapsed && (
        <div className="px-4 pb-3 border-t border-[#3A373C]">
          {/* Column headers */}
          <div className="flex items-center gap-2 pt-2 pb-1">
            <span className="w-5" />
            <span className="w-14 text-[9px] text-[#3A373C] uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>Flags</span>
            <span className="w-16 text-[9px] text-[#3A373C] uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>Weight</span>
            <span className="w-14 text-[9px] text-[#3A373C] uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>Reps</span>
            <span className="w-12 text-[9px] text-[#3A373C] uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>Effort</span>
            <span className="flex-1 text-[9px] text-[#3A373C] uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>Note</span>
          </div>

          {exercise.sets.map((set, i) => (
            <SetRow
              key={i}
              set={set}
              onChange={(patch) => updateSet(i, patch)}
              onDelete={() => deleteSet(i)}
            />
          ))}

          <button
            type="button"
            onClick={addSet}
            className="mt-2 flex items-center gap-1.5 text-[11px] text-[#6B6870] hover:text-[#C8F04D] transition-colors uppercase tracking-[0.1em] font-semibold"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <Plus size={10} /> Add Set
          </button>
        </div>
      )}
    </div>
  )
}

// ── Block card ────────────────────────────────────────────────────────────────

function BlockCard({
  block,
  onChange,
  onDelete,
}: {
  block: DraftBlock
  onChange: (patch: Partial<DraftBlock>) => void
  onDelete: () => void
}) {
  const updateExercise = (i: number, patch: Partial<DraftExercise>) =>
    onChange({ exercises: block.exercises.map((ex, idx) => (idx === i ? { ...ex, ...patch } : ex)) })

  const deleteExercise = (i: number) =>
    onChange({ exercises: block.exercises.filter((_, idx) => idx !== i) })

  const addExercise = () =>
    onChange({ exercises: [...block.exercises, blankExercise(block.exercises.length)] })

  return (
    <div className="border border-[#3A373C] p-4 space-y-3">
      {/* Block header */}
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={block.block_name ?? ''}
            onChange={(e) => onChange({ block_name: e.target.value || null })}
            placeholder="Block name (optional)"
            className="w-full bg-transparent outline-none text-[13px] font-semibold text-white placeholder-[#3A373C] border-b border-[#3A373C] focus:border-[#C8F04D] pb-1 transition-colors"
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em' }}
          />
          <div className="flex flex-wrap gap-1.5">
            {BLOCK_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ block_type: value })}
                className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] border transition-colors ${
                  block.block_type === value
                    ? 'bg-[#C8F04D] border-[#C8F04D] text-[#141115]'
                    : 'border-[#3A373C] text-[#6B6870] hover:border-[#6B6870]'
                }`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="text-[#3A373C] hover:text-[#FF4D4D] transition-colors mt-1 shrink-0"
          aria-label="Remove block"
        >
          <X size={14} />
        </button>
      </div>

      {/* Exercises */}
      <div className="space-y-2">
        {block.exercises.map((ex, i) => (
          <ExerciseCard
            key={i}
            exercise={ex}
            onChange={(patch) => updateExercise(i, patch)}
            onDelete={() => deleteExercise(i)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addExercise}
        className="flex items-center gap-2 px-3 py-1.5 border border-[#3A373C] text-[#6B6870] text-[10px] font-semibold uppercase tracking-[0.15em] hover:border-[#C8F04D] hover:text-[#C8F04D] transition-colors"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <Plus size={10} /> Add Exercise
      </button>
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

type Props = {
  blocks: DraftBlock[]
  onChange: (blocks: DraftBlock[]) => void
}

export default function StrengthPanel({ blocks, onChange }: Props) {
  const updateBlock = (i: number, patch: Partial<DraftBlock>) =>
    onChange(blocks.map((b, idx) => (idx === i ? { ...b, ...patch } : b)))

  const deleteBlock = (i: number) => onChange(blocks.filter((_, idx) => idx !== i))

  const addBlock = () => onChange([...blocks, blankBlock(blocks.length)])

  return (
    <div className="space-y-4">
      <p
        className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        Blocks &amp; Exercises
      </p>

      {blocks.map((block, i) => (
        <BlockCard
          key={i}
          block={block}
          onChange={(patch) => updateBlock(i, patch)}
          onDelete={() => deleteBlock(i)}
        />
      ))}

      <button
        type="button"
        onClick={addBlock}
        className="flex items-center gap-2 px-4 py-2 border border-[#3A373C] text-[#6B6870] text-[11px] font-semibold uppercase tracking-[0.15em] hover:border-[#C8F04D] hover:text-[#C8F04D] transition-colors"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <Plus size={12} /> Add Block
      </button>
    </div>
  )
}
