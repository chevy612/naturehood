'use client'

import { Plus, X } from 'lucide-react'
import type { SprintEffortRow, SprintRepRow } from '@/lib/types'

export type DraftSprintRep = Omit<SprintRepRow, 'id' | 'effort_id' | 'training_log_id' | 'user_id'>
export type DraftSprintEffort = Omit<SprintEffortRow, 'id' | 'training_log_id' | 'user_id'> & {
  reps: DraftSprintRep[]
}

const DRILL_TYPES = [
  'block_start', 'fly', 'acceleration', 'tempo',
  'speed_endurance', 'hill_sprint', 'hurdle', 'relay_exchange', 'time_trial',
] as const

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
  const num = (v: string) => (v === '' ? null : isNaN(Number(v)) ? null : Number(v))

  return (
    <div className="flex items-center gap-2 py-1.5 border-t border-[#2A272C]">
      <span className="text-[11px] text-[#6B6870] w-5 shrink-0 text-right" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {rep.rep_index + 1}
      </span>

      <input
        type="number"
        step="0.01"
        value={rep.time_seconds ?? ''}
        placeholder="time (s)"
        onChange={(e) => onChange({ time_seconds: num(e.target.value) })}
        className="w-20 bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-[12px] text-white px-2 py-1 transition-colors"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />

      <input
        type="number"
        step="0.01"
        value={rep.wind_ms ?? ''}
        placeholder="wind m/s"
        onChange={(e) => onChange({ wind_ms: num(e.target.value) })}
        className="w-20 bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-[12px] text-white px-2 py-1 transition-colors"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />

      <button
        type="button"
        onClick={() => onChange({ completed: !rep.completed })}
        className={`px-2 py-1 text-[9px] font-bold uppercase border transition-colors shrink-0 ${
          rep.completed
            ? 'border-[#3A373C] text-[#6B6870]'
            : 'border-[#FF4D4D] text-[#FF4D4D]'
        }`}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {rep.completed ? 'OK' : 'DNF'}
      </button>

      <input
        type="text"
        value={rep.notes ?? ''}
        placeholder="note"
        onChange={(e) => onChange({ notes: e.target.value || null })}
        className="flex-1 bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-[12px] text-white px-2 py-1 transition-colors min-w-0"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />

      <button
        type="button"
        onClick={onDelete}
        className="text-[#3A373C] hover:text-[#FF4D4D] transition-colors shrink-0"
        aria-label="Remove rep"
      >
        <X size={12} />
      </button>
    </div>
  )
}

// ── Effort card ───────────────────────────────────────────────────────────────

function EffortCard({
  effort,
  onChange,
  onDelete,
}: {
  effort: DraftSprintEffort
  onChange: (patch: Partial<DraftSprintEffort>) => void
  onDelete: () => void
}) {
  const num = (v: string) => (v === '' ? null : isNaN(Number(v)) ? null : Number(v))

  const updateRep = (i: number, patch: Partial<DraftSprintRep>) =>
    onChange({ reps: effort.reps.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) })

  const deleteRep = (i: number) =>
    onChange({ reps: effort.reps.filter((_, idx) => idx !== i) })

  const addRep = () =>
    onChange({ reps: [...effort.reps, blankRep(effort.reps.length)] })

  return (
    <div className="border border-[#3A373C] bg-[#1A1719] p-4 space-y-3">
      {/* Effort header */}
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-3">
          {/* Drill type */}
          <div className="flex flex-wrap gap-1.5">
            {DRILL_TYPES.map((dt) => (
              <button
                key={dt}
                type="button"
                onClick={() => onChange({ drill_type: dt })}
                className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] border transition-colors ${
                  effort.drill_type === dt
                    ? 'bg-[#C8F04D] border-[#C8F04D] text-[#141115]'
                    : 'border-[#3A373C] text-[#6B6870] hover:border-[#6B6870]'
                }`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {dt.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {/* Metrics row */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#6B6870]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Distance (m)</span>
              <input
                type="number"
                value={effort.distance_m ?? ''}
                placeholder="—"
                onChange={(e) => onChange({ distance_m: num(e.target.value) })}
                className="w-16 bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-[12px] text-white px-2 py-1 transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#6B6870]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Effort %</span>
              <input
                type="number"
                min={0}
                max={100}
                value={effort.effort_percent ?? ''}
                placeholder="—"
                onChange={(e) => onChange({ effort_percent: num(e.target.value) as number | null })}
                className="w-14 bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-[12px] text-white px-2 py-1 transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#6B6870]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Rest (s)</span>
              <input
                type="number"
                value={effort.rest_between_reps_seconds ?? ''}
                placeholder="—"
                onChange={(e) => onChange({ rest_between_reps_seconds: num(e.target.value) as number | null })}
                className="w-14 bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-[12px] text-white px-2 py-1 transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="text-[#3A373C] hover:text-[#FF4D4D] transition-colors shrink-0 mt-1"
          aria-label="Remove effort"
        >
          <X size={14} />
        </button>
      </div>

      {/* Reps */}
      <div className="border-t border-[#2A272C]">
        <div className="flex items-center gap-2 pt-2 pb-1">
          <span className="w-5" />
          <span className="w-20 text-[9px] text-[#3A373C] uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>Time (s)</span>
          <span className="w-20 text-[9px] text-[#3A373C] uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>Wind</span>
          <span className="w-10 text-[9px] text-[#3A373C] uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>Status</span>
          <span className="flex-1 text-[9px] text-[#3A373C] uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>Note</span>
        </div>
        {effort.reps.map((rep, i) => (
          <RepRow
            key={i}
            rep={rep}
            onChange={(patch) => updateRep(i, patch)}
            onDelete={() => deleteRep(i)}
          />
        ))}
        <button
          type="button"
          onClick={addRep}
          className="mt-2 flex items-center gap-1.5 text-[11px] text-[#6B6870] hover:text-[#C8F04D] transition-colors uppercase tracking-[0.1em] font-semibold"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <Plus size={10} /> Add Rep
        </button>
      </div>
    </div>
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
    <div className="space-y-4">
      <p
        className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        Sprint Session
      </p>

      {/* Session-level meta */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#6B6870]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Surface</span>
          <input
            type="text"
            value={surface ?? ''}
            placeholder="track, grass…"
            onChange={(e) => onMetaChange({ surface: e.target.value || null })}
            className="bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-[12px] text-white px-2 py-1 transition-colors w-28"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#6B6870]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Footwear</span>
          <input
            type="text"
            value={footwear ?? ''}
            placeholder="spikes, flats…"
            onChange={(e) => onMetaChange({ footwear: e.target.value || null })}
            className="bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-[12px] text-white px-2 py-1 transition-colors w-28"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
      </div>

      {/* Efforts */}
      {efforts.map((effort, i) => (
        <EffortCard
          key={i}
          effort={effort}
          onChange={(patch) => updateEffort(i, patch)}
          onDelete={() => deleteEffort(i)}
        />
      ))}

      <button
        type="button"
        onClick={addEffort}
        className="flex items-center gap-2 px-4 py-2 border border-[#3A373C] text-[#6B6870] text-[11px] font-semibold uppercase tracking-[0.15em] hover:border-[#C8F04D] hover:text-[#C8F04D] transition-colors"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <Plus size={12} /> Add Effort
      </button>
    </div>
  )
}
