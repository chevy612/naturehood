'use client'

import { Plus, X, ChevronDown, ChevronRight, Layers } from 'lucide-react'
import { useState } from 'react'
import type { SessionBlockRow, SessionExerciseRow, ExerciseSetRow, BlockType } from '@/lib/types'
import { Button, ButtonPropertySelect, ButtonToggle } from '@/app/components/ui/buttons'
import { InputInline } from '@/app/components/ui/inputs'
import { ReportSection, ReportCard, ColumnLabel, toNum } from '@/app/components/platform/ReportSection'

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

// # · weight · reps · effort · flags · note · delete  (note drops to its own line on mobile)
const SET_GRID =
  'grid items-center gap-x-1 grid-cols-[1.25rem_1fr_1fr_1fr_auto_1.75rem] sm:grid-cols-[1.25rem_4.5rem_4rem_3.5rem_auto_minmax(0,1fr)_1.75rem]'

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
  const note = (
    <InputInline
      value={set.notes}
      placeholder="Add note"
      onValueChange={(v) => onChange({ notes: v || null })}
    />
  )

  return (
    <div className="group border-t border-[#2A272C] px-2 py-0.5">
      <div className={SET_GRID}>
        <span className="text-right text-[12px] tabular-nums text-[#6B6870]">{set.set_index + 1}</span>
        <InputInline type="number" step="0.5" value={set.weight_kg} placeholder="kg" ariaLabel="Weight (kg)"
          onValueChange={(v) => onChange({ weight_kg: toNum(v) })} />
        <InputInline type="number" value={set.reps} placeholder="—" ariaLabel="Reps"
          onValueChange={(v) => onChange({ reps: toNum(v) })} />
        <InputInline type="number" min={0} max={100} value={set.effort_percent} placeholder="%" ariaLabel="Effort %"
          onValueChange={(v) => onChange({ effort_percent: toNum(v) })} />
        <div className="flex gap-1 px-1">
          {(['is_warmup', 'is_failure', 'is_dropset'] as const).map((flag) => (
            <ButtonToggle
              key={flag}
              pressed={set[flag]}
              onPressedChange={(pressed) => onChange({ [flag]: pressed })}
              ariaLabel={flag === 'is_warmup' ? 'Warm-up set' : flag === 'is_failure' ? 'To failure' : 'Drop set'}
            >
              {flag === 'is_warmup' ? 'WU' : flag === 'is_failure' ? 'F' : 'D'}
            </ButtonToggle>
          ))}
        </div>
        <div className="hidden sm:block">{note}</div>
        <Button variant="ghost" size="icon-sm" onClick={onDelete} ariaLabel="Remove set"
          className="opacity-60 group-hover:opacity-100 focus-visible:opacity-100">
          <X size={14} />
        </Button>
      </div>
      <div className="pl-6 sm:hidden">{note}</div>
    </div>
  )
}

// ── Exercise ──────────────────────────────────────────────────────────────────

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
    <div className="border-t border-[#2A272C] first:border-t-0">
      {/* Exercise header */}
      <div className="flex items-center gap-1 px-2 py-1.5">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed((c) => !c)}
          ariaLabel={collapsed ? 'Expand exercise' : 'Collapse exercise'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </Button>
        <InputInline
          value={exercise.name}
          onValueChange={(v) => onChange({ name: v })}
          placeholder="Exercise name"
          className="flex-1 text-[14px] font-medium"
        />
        <span className="shrink-0 px-1 text-[12px] tabular-nums text-[#6B6870]">
          {exercise.sets.length} {exercise.sets.length === 1 ? 'set' : 'sets'}
        </span>
        <Button variant="ghost" size="icon-sm" onClick={onDelete} ariaLabel="Remove exercise">
          <X size={14} />
        </Button>
      </div>

      {!collapsed && (
        <div className="pb-1">
          <div className={`${SET_GRID} px-2 pb-1`}>
            <span />
            <ColumnLabel>Kg</ColumnLabel>
            <ColumnLabel>Reps</ColumnLabel>
            <ColumnLabel>Effort</ColumnLabel>
            <ColumnLabel className="px-1">Flags</ColumnLabel>
            <ColumnLabel className="hidden sm:block">Note</ColumnLabel>
            <span />
          </div>

          {exercise.sets.map((set, i) => (
            <SetRow
              key={i}
              set={set}
              onChange={(patch) => updateSet(i, patch)}
              onDelete={() => deleteSet(i)}
            />
          ))}

          <div className="border-t border-[#2A272C] px-2 pt-1">
            <Button variant="ghost" size="sm" onClick={addSet}>
              <Plus size={14} /> Add set
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Block ─────────────────────────────────────────────────────────────────────

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
    <ReportCard>
      {/* Block header */}
      <div className="flex items-center gap-2 border-b border-[#2A272C] px-2 py-2">
        <InputInline
          value={block.block_name}
          onValueChange={(v) => onChange({ block_name: v || null })}
          placeholder="Untitled block"
          className="flex-1 text-[14px] font-semibold"
        />
        <ButtonPropertySelect
          label="Block type"
          options={BLOCK_TYPES}
          value={block.block_type}
          onChange={(v) => v && onChange({ block_type: v })}
          icon={<Layers />}
          align="right"
        />
        <Button variant="ghost" size="icon-sm" onClick={onDelete} ariaLabel="Remove block">
          <X size={14} />
        </Button>
      </div>

      {block.exercises.map((ex, i) => (
        <ExerciseCard
          key={i}
          exercise={ex}
          onChange={(patch) => updateExercise(i, patch)}
          onDelete={() => deleteExercise(i)}
        />
      ))}

      <div className="border-t border-[#2A272C] px-2 py-1.5">
        <Button variant="ghost" size="sm" onClick={addExercise}>
          <Plus size={14} /> Add exercise
        </Button>
      </div>
    </ReportCard>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

type Props = {
  blocks: DraftBlock[]
  onChange: (blocks: DraftBlock[]) => void
  title?: string
}

export default function StrengthPanel({ blocks, onChange, title = 'Blocks' }: Props) {
  const updateBlock = (i: number, patch: Partial<DraftBlock>) =>
    onChange(blocks.map((b, idx) => (idx === i ? { ...b, ...patch } : b)))

  const deleteBlock = (i: number) => onChange(blocks.filter((_, idx) => idx !== i))

  const addBlock = () => onChange([...blocks, blankBlock(blocks.length)])

  return (
    <ReportSection
      title={title}
      count={blocks.length}
      action={
        <Button variant="ghost" size="sm" onClick={addBlock}>
          <Plus size={14} /> Add block
        </Button>
      }
    >
      <div className="space-y-3">
        {blocks.map((block, i) => (
          <BlockCard
            key={i}
            block={block}
            onChange={(patch) => updateBlock(i, patch)}
            onDelete={() => deleteBlock(i)}
          />
        ))}
      </div>
    </ReportSection>
  )
}
