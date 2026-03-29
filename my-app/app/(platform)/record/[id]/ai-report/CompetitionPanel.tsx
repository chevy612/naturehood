'use client'

import { Plus, X } from 'lucide-react'
import type { CompetitionResultRow, CompetitionRoundRow } from '@/lib/types'

export type DraftRound = Omit<CompetitionRoundRow, 'id' | 'competition_result_id' | 'training_log_id' | 'user_id'>
export type DraftCompetitionResult = Omit<CompetitionResultRow, 'id' | 'training_log_id' | 'user_id'> & {
  rounds: DraftRound[]
}

const ROUND_TYPES = ['heat', 'semifinal', 'final', 'relay'] as const
const STATUSES = ['completed', 'dns', 'dnf', 'dq'] as const

function blankRound(round_index: number): DraftRound {
  return {
    round_index,
    round_type: 'final',
    time_seconds: null,
    wind_ms: null,
    ranking: null,
    pb: false,
    sb: false,
    relay_leg: null,
    relay_split_seconds: null,
    notes: null,
  }
}

// ── Round row ─────────────────────────────────────────────────────────────────

function RoundRow({
  round,
  onChange,
  onDelete,
}: {
  round: DraftRound
  onChange: (patch: Partial<DraftRound>) => void
  onDelete: () => void
}) {
  const num = (v: string) => (v === '' ? null : isNaN(Number(v)) ? null : Number(v))

  return (
    <div className="flex items-center gap-2 py-2 border-t border-[#2A272C] flex-wrap">
      {/* Round type */}
      <div className="flex gap-1">
        {ROUND_TYPES.map((rt) => (
          <button
            key={rt}
            type="button"
            onClick={() => onChange({ round_type: rt })}
            className={`px-2 py-0.5 text-[9px] font-bold uppercase border transition-colors ${
              round.round_type === rt
                ? 'bg-[#C8F04D] border-[#C8F04D] text-[#141115]'
                : 'border-[#3A373C] text-[#6B6870] hover:border-[#6B6870]'
            }`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {rt}
          </button>
        ))}
      </div>

      {/* Time */}
      <input
        type="number"
        step="0.01"
        value={round.time_seconds ?? ''}
        placeholder="time (s)"
        onChange={(e) => onChange({ time_seconds: num(e.target.value) })}
        className="w-20 bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-[12px] text-white px-2 py-1 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />

      {/* Wind */}
      <input
        type="number"
        step="0.1"
        value={round.wind_ms ?? ''}
        placeholder="wind"
        onChange={(e) => onChange({ wind_ms: num(e.target.value) })}
        className="w-16 bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-[12px] text-white px-2 py-1 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />

      {/* Ranking */}
      <input
        type="number"
        value={round.ranking ?? ''}
        placeholder="rank"
        onChange={(e) => onChange({ ranking: num(e.target.value) as number | null })}
        className="w-14 bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-[12px] text-white px-2 py-1 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />

      {/* PB / SB flags */}
      {(['pb', 'sb'] as const).map((flag) => (
        <button
          key={flag}
          type="button"
          onClick={() => onChange({ [flag]: !round[flag] })}
          className={`px-2 py-1 text-[9px] font-bold uppercase border transition-colors ${
            round[flag]
              ? 'bg-[#C8F04D] border-[#C8F04D] text-[#141115]'
              : 'border-[#3A373C] text-[#3A373C] hover:border-[#6B6870]'
          }`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {flag.toUpperCase()}
        </button>
      ))}

      {/* Notes */}
      <input
        type="text"
        value={round.notes ?? ''}
        placeholder="note"
        onChange={(e) => onChange({ notes: e.target.value || null })}
        className="flex-1 bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-[12px] text-white px-2 py-1 transition-colors min-w-0"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />

      <button
        type="button"
        onClick={onDelete}
        className="text-[#3A373C] hover:text-[#FF4D4D] transition-colors shrink-0"
        aria-label="Remove round"
      >
        <X size={12} />
      </button>
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

type Props = {
  result: DraftCompetitionResult
  onChange: (patch: Partial<DraftCompetitionResult>) => void
}

export default function CompetitionPanel({ result, onChange }: Props) {
  const updateRound = (i: number, patch: Partial<DraftRound>) =>
    onChange({ rounds: result.rounds.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) })

  const deleteRound = (i: number) =>
    onChange({ rounds: result.rounds.filter((_, idx) => idx !== i) })

  const addRound = () =>
    onChange({ rounds: [...result.rounds, blankRound(result.rounds.length)] })

  const field = (label: string, key: keyof DraftCompetitionResult, placeholder = '—') => (
    <div className="flex items-center border-t border-[#2A272C] py-2.5 gap-3 min-h-10">
      <span className="text-[12px] text-[#6B6870] w-32 shrink-0" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </span>
      <input
        type="text"
        value={(result[key] as string) ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange({ [key]: e.target.value || null } as Partial<DraftCompetitionResult>)}
        className="flex-1 bg-transparent outline-none text-[13px] text-white placeholder-[#3A373C]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />
    </div>
  )

  return (
    <div className="space-y-6">
      <p
        className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        Competition Details
      </p>

      {/* Competition metadata */}
      <div className="border border-[#3A373C] px-4">
        {field('Event', 'event', 'e.g. 100m')}
        {field('Competition', 'competition_name')}
        {field('Venue', 'venue')}
        <div className="flex items-center border-t border-[#2A272C] py-2.5 gap-3 min-h-10">
          <span className="text-[12px] text-[#6B6870] w-32 shrink-0" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Lane
          </span>
          <input
            type="number"
            value={result.lane ?? ''}
            placeholder="—"
            onChange={(e) => onChange({ lane: e.target.value === '' ? null : Number(e.target.value) })}
            className="w-16 bg-transparent outline-none text-[13px] text-white placeholder-[#3A373C] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
        {field('Conditions', 'conditions', 'e.g. +0.5 m/s')}
        {field('Notes', 'notes')}
      </div>

      {/* Status */}
      <div>
        <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#6B6870] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
          Status
        </p>
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ status: s })}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] border transition-colors ${
                result.status === s
                  ? 'bg-[#C8F04D] border-[#C8F04D] text-[#141115]'
                  : 'border-[#3A373C] text-[#6B6870] hover:border-[#6B6870]'
              }`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {s}
            </button>
          ))}
        </div>
        {(result.status === 'dns') && (
          <input
            type="text"
            value={result.dns_reason ?? ''}
            placeholder="DNS reason"
            onChange={(e) => onChange({ dns_reason: e.target.value || null })}
            className="mt-2 w-full bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-[12px] text-white px-3 py-2 transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
        )}
      </div>

      {/* Rounds */}
      <div>
        <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#6B6870] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
          Rounds
        </p>
        <div className="flex items-center gap-2 pb-1">
          <span className="flex-[2] text-[9px] text-[#3A373C] uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>Type</span>
          <span className="w-20 text-[9px] text-[#3A373C] uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>Time (s)</span>
          <span className="w-16 text-[9px] text-[#3A373C] uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>Wind</span>
          <span className="w-14 text-[9px] text-[#3A373C] uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>Rank</span>
          <span className="w-14 text-[9px] text-[#3A373C] uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>Flags</span>
          <span className="flex-1 text-[9px] text-[#3A373C] uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>Note</span>
        </div>
        {result.rounds.map((round, i) => (
          <RoundRow
            key={i}
            round={round}
            onChange={(patch) => updateRound(i, patch)}
            onDelete={() => deleteRound(i)}
          />
        ))}
        <button
          type="button"
          onClick={addRound}
          className="mt-3 flex items-center gap-2 px-4 py-2 border border-[#3A373C] text-[#6B6870] text-[11px] font-semibold uppercase tracking-[0.15em] hover:border-[#C8F04D] hover:text-[#C8F04D] transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <Plus size={12} /> Add Round
        </button>
      </div>
    </div>
  )
}
