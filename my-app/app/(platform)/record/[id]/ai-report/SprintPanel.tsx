'use client'

import type { ReactNode } from 'react'
import { Plus, X, Zap } from 'lucide-react'
import type { SprintEffortRow, SprintRepRow } from '@/lib/types'
import { Button, ButtonPropertySelect, ButtonToggle } from '@/app/components/ui/buttons'
import { InputInline } from '@/app/components/ui/inputs'
import { ReportSection, ReportCard, ColumnLabel, PropertyRow, toNum } from './ReportSection'

export type DraftSprintRep = Omit<SprintRepRow, 'id' | 'effort_id' | 'training_log_id' | 'user_id'>
export type DraftSprintEffort = Omit<SprintEffortRow, 'id' | 'training_log_id' | 'user_id'> & {
  reps: DraftSprintRep[]
}

const DRILL_TYPES = [
  'block_start', 'fly', 'acceleration', 'tempo',
  'speed_endurance', 'hill_sprint', 'hurdle', 'relay_exchange', 'time_trial',
] as const

const DRILL_OPTIONS = DRILL_TYPES.map((dt) => {
  const label = dt.replace(/_/g, ' ')
  return { value: dt, label: label.charAt(0).toUpperCase() + label.slice(1) }
})

function blankRep(rep_index: number): DraftSprintRep {
  return { rep_index, time_seconds: null, split_times_seconds: null, wind_ms: null, completed: true, notes: null }
}

function blankEffort(effort_index: number): DraftSprintEffort {
  return {
    effort_index,
    drill_type: 'acceleration',
    distance_m: null,
    phase_distances_m: null,
    effort_percent: null,
    footwear: null,
    rest_between_reps_seconds: null,
    rest_between_sets_seconds: null,
    sets: null,
    notes: null,
    reps: [blankRep(0)],
  }
}

// # · time · wind · status · note · delete  (note drops to its own line on mobile)
const REP_GRID =
  'grid items-center gap-x-1 grid-cols-[1.25rem_1fr_1fr_auto_1.75rem] sm:grid-cols-[1.25rem_5rem_5rem_auto_minmax(0,1fr)_1.75rem]'

// ── Rep row ───────────────────────────────────────────────────────────────────

function RepRow({
  rep,
  onChange,
  onDelete,
}: {
  rep: DraftSprintRep
  onChange: (patch: Partial<DraftSprintRep>) => void
  onDelete: () => void
}) {
  const note = (
    <InputInline value={rep.notes} placeholder="Add note" onValueChange={(v) => onChange({ notes: v || null })} />
  )

  return (
    <div className="group border-t border-[#2A272C] px-2 py-0.5">
      <div className={REP_GRID}>
        <span className="text-right text-[12px] tabular-nums text-[#6B6870]">{rep.rep_index + 1}</span>
        <InputInline type="number" step="0.01" value={rep.time_seconds} placeholder="s" ariaLabel="Time (s)"
          onValueChange={(v) => onChange({ time_seconds: toNum(v) })} />
        <InputInline type="number" step="0.1" value={rep.wind_ms} placeholder="m/s" ariaLabel="Wind (m/s)"
          onValueChange={(v) => onChange({ wind_ms: toNum(v) })} />
        <div className="px-1">
          <ButtonToggle
            pressed={!rep.completed}
            onPressedChange={(dnf) => onChange({ completed: !dnf })}
            tone="destructive"
            ariaLabel="Did not finish"
          >
            {rep.completed ? 'OK' : 'DNF'}
          </ButtonToggle>
        </div>
        <div className="hidden sm:block">{note}</div>
        <Button variant="ghost" size="icon-sm" onClick={onDelete} ariaLabel="Remove rep"
          className="opacity-60 group-hover:opacity-100 focus-visible:opacity-100">
          <X size={14} />
        </Button>
      </div>
      <div className="pl-6 sm:hidden">{note}</div>
    </div>
  )
}

// ── Effort card ───────────────────────────────────────────────────────────────

function Metric({ label, unit, children }: { label: string; unit?: string; children: ReactNode }) {
  return (
    <label className="flex items-center gap-1 text-[12px] text-[#847E89]">
      <span className="shrink-0">{label}</span>
      <span className="w-16">{children}</span>
      {unit && <span className="shrink-0 text-[#6B6870]">{unit}</span>}
    </label>
  )
}

function EffortCard({
  effort,
  onChange,
  onDelete,
}: {
  effort: DraftSprintEffort
  onChange: (patch: Partial<DraftSprintEffort>) => void
  onDelete: () => void
}) {
  const updateRep = (i: number, patch: Partial<DraftSprintRep>) =>
    onChange({ reps: effort.reps.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) })

  const deleteRep = (i: number) =>
    onChange({ reps: effort.reps.filter((_, idx) => idx !== i) })

  const addRep = () =>
    onChange({ reps: [...effort.reps, blankRep(effort.reps.length)] })

  return (
    <ReportCard>
      {/* Effort header */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-[#2A272C] px-3 py-2">
        <ButtonPropertySelect
          label="Drill type"
          options={DRILL_OPTIONS}
          value={effort.drill_type}
          onChange={(v) => v && onChange({ drill_type: v })}
          icon={<Zap />}
        />
        <Metric label="Distance" unit="m">
          <InputInline type="number" value={effort.distance_m} placeholder="—" ariaLabel="Distance (m)"
            onValueChange={(v) => onChange({ distance_m: toNum(v) })} />
        </Metric>
        <Metric label="Effort" unit="%">
          <InputInline type="number" min={0} max={100} value={effort.effort_percent} placeholder="—" ariaLabel="Effort %"
            onValueChange={(v) => onChange({ effort_percent: toNum(v) })} />
        </Metric>
        <Metric label="Rest" unit="s">
          <InputInline type="number" value={effort.rest_between_reps_seconds} placeholder="—" ariaLabel="Rest (s)"
            onValueChange={(v) => onChange({ rest_between_reps_seconds: toNum(v) })} />
        </Metric>
        <Button variant="ghost" size="icon-sm" onClick={onDelete} ariaLabel="Remove effort" className="ml-auto">
          <X size={14} />
        </Button>
      </div>

      {/* Reps */}
      <div className={`${REP_GRID} px-2 pb-1 pt-2`}>
        <span />
        <ColumnLabel>Time</ColumnLabel>
        <ColumnLabel>Wind</ColumnLabel>
        <ColumnLabel className="px-1">Status</ColumnLabel>
        <ColumnLabel className="hidden sm:block">Note</ColumnLabel>
        <span />
      </div>
      {effort.reps.map((rep, i) => (
        <RepRow
          key={i}
          rep={rep}
          onChange={(patch) => updateRep(i, patch)}
          onDelete={() => deleteRep(i)}
        />
      ))}
      <div className="border-t border-[#2A272C] px-2 py-1.5">
        <Button variant="ghost" size="sm" onClick={addRep}>
          <Plus size={14} /> Add rep
        </Button>
      </div>
    </ReportCard>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

type Props = {
  efforts: DraftSprintEffort[]
  surface: string | null
  footwear: string | null
  onEffortsChange: (efforts: DraftSprintEffort[]) => void
  onMetaChange: (patch: { surface?: string | null; footwear?: string | null }) => void
}

export default function SprintPanel({ efforts, surface, footwear, onEffortsChange, onMetaChange }: Props) {
  const updateEffort = (i: number, patch: Partial<DraftSprintEffort>) =>
    onEffortsChange(efforts.map((e, idx) => (idx === i ? { ...e, ...patch } : e)))

  const deleteEffort = (i: number) => onEffortsChange(efforts.filter((_, idx) => idx !== i))

  const addEffort = () => onEffortsChange([...efforts, blankEffort(efforts.length)])

  return (
    <div className="space-y-10">
      <ReportSection title="Conditions">
        <div>
          <PropertyRow label="Surface">
            <InputInline value={surface} placeholder="Track, grass…" onValueChange={(v) => onMetaChange({ surface: v || null })} />
          </PropertyRow>
          <PropertyRow label="Footwear">
            <InputInline value={footwear} placeholder="Spikes, flats…" onValueChange={(v) => onMetaChange({ footwear: v || null })} />
          </PropertyRow>
        </div>
      </ReportSection>

      <ReportSection
        title="Efforts"
        count={efforts.length}
        action={
          <Button variant="ghost" size="sm" onClick={addEffort}>
            <Plus size={14} /> Add effort
          </Button>
        }
      >
        <div className="space-y-3">
          {efforts.map((effort, i) => (
            <EffortCard
              key={i}
              effort={effort}
              onChange={(patch) => updateEffort(i, patch)}
              onDelete={() => deleteEffort(i)}
            />
          ))}
        </div>
      </ReportSection>
    </div>
  )
}
