'use client'

import { Plus, X, Flag, CircleCheck, CircleSlash, CircleX, Ban } from 'lucide-react'
import type { CompetitionResultRow, CompetitionRoundRow } from '@/lib/types'
import { Button, ButtonPropertySelect, ButtonToggle } from '@/app/components/ui/buttons'
import { InputInline } from '@/app/components/ui/inputs'
import { ReportSection, ReportCard, ColumnLabel, PropertyRow, toNum } from './ReportSection'

export type DraftRound = Omit<CompetitionRoundRow, 'id' | 'competition_result_id' | 'training_log_id' | 'user_id'>
export type DraftCompetitionResult = Omit<CompetitionResultRow, 'id' | 'training_log_id' | 'user_id'> & {
  rounds: DraftRound[]
}

const ROUND_TYPES = [
  { value: 'heat',      label: 'Heat' },
  { value: 'semifinal', label: 'Semi' },
  { value: 'final',     label: 'Final' },
  { value: 'relay',     label: 'Relay' },
] as const
const STATUSES = [
  { value: 'completed', label: 'Completed',         icon: <CircleCheck /> },
  { value: 'dns',       label: 'DNS',      icon: <CircleSlash /> },
  { value: 'dnf',       label: 'DNF',      icon: <CircleX /> },
  { value: 'dq',        label: 'DQ',       icon: <Ban /> },
] as const

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

// type · time · wind · rank · flags · note · delete  (flags + note wrap to a second line on mobile)
const ROUND_GRID =
  'grid items-center gap-x-1 grid-cols-[6rem_1fr_1fr_1fr_1.75rem] sm:grid-cols-[6.5rem_4.5rem_4rem_3.5rem_auto_minmax(0,1fr)_1.75rem]'

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
  const flags = (
    <div className="flex gap-1 px-1">
      {(['pb', 'sb'] as const).map((flag) => (
        <ButtonToggle
          key={flag}
          pressed={!!round[flag]}
          onPressedChange={(pressed) => onChange({ [flag]: pressed })}
          ariaLabel={flag === 'pb' ? 'Personal best' : 'Season best'}
        >
          {flag.toUpperCase()}
        </ButtonToggle>
      ))}
    </div>
  )
  const note = (
    <InputInline value={round.notes} placeholder="Add note" onValueChange={(v) => onChange({ notes: v || null })} />
  )

  return (
    <div className="group border-t border-[#2A272C] px-2 py-1">
      <div className={ROUND_GRID}>
        <ButtonPropertySelect
          label="Round"
          options={ROUND_TYPES}
          value={round.round_type}
          onChange={(v) => v && onChange({ round_type: v })}
          icon={<Flag />}
        />
        <InputInline type="number" step="0.01" value={round.time_seconds} placeholder="s" ariaLabel="Time (s)"
          onValueChange={(v) => onChange({ time_seconds: toNum(v) })} />
        <InputInline type="number" step="0.1" value={round.wind_ms} placeholder="m/s" ariaLabel="Wind (m/s)"
          onValueChange={(v) => onChange({ wind_ms: toNum(v) })} />
        <InputInline type="number" value={round.ranking} placeholder="—" ariaLabel="Rank"
          onValueChange={(v) => onChange({ ranking: toNum(v) })} />
        <div className="hidden sm:block">{flags}</div>
        <div className="hidden sm:block">{note}</div>
        <Button variant="ghost" size="icon-sm" onClick={onDelete} ariaLabel="Remove round"
          className="opacity-60 group-hover:opacity-100 focus-visible:opacity-100">
          <X size={14} />
        </Button>
      </div>
      <div className="flex items-center gap-1 pt-1 sm:hidden">
        {flags}
        <div className="flex-1">{note}</div>
      </div>
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

  const field = (label: string, key: keyof DraftCompetitionResult, placeholder = 'Empty') => (
    <PropertyRow label={label}>
      <InputInline
        value={result[key] as string | null}
        placeholder={placeholder}
        onValueChange={(v) => onChange({ [key]: v || null } as Partial<DraftCompetitionResult>)}
      />
    </PropertyRow>
  )

  return (
    <div className="space-y-10">
      <ReportSection
        title="Competition"
        action={
          <ButtonPropertySelect
            label="Status"
            options={STATUSES}
            value={result.status}
            onChange={(v) => v && onChange({ status: v })}
            align="right"
          />
        }
      >
        <div>
          {field('Event', 'event', 'e.g. 100m')}
          {field('Competition', 'competition_name')}
          {field('Venue', 'venue')}
          <PropertyRow label="Lane">
            <InputInline
              type="number"
              value={result.lane}
              placeholder="Empty"
              onValueChange={(v) => onChange({ lane: toNum(v) })}
            />
          </PropertyRow>
          {field('Conditions', 'conditions', 'e.g. +0.5 m/s')}
          {result.status === 'dns' && field('DNS reason', 'dns_reason')}
          {field('Notes', 'notes')}
        </div>
      </ReportSection>

      <ReportSection
        title="Rounds"
        count={result.rounds.length}
        action={
          <Button variant="ghost" size="sm" onClick={addRound}>
            <Plus size={14} /> Add round
          </Button>
        }
      >
        <ReportCard>
          <div className={`${ROUND_GRID} px-2 pb-1 pt-2`}>
            <ColumnLabel>Round</ColumnLabel>
            <ColumnLabel>Time</ColumnLabel>
            <ColumnLabel>Wind</ColumnLabel>
            <ColumnLabel>Rank</ColumnLabel>
            <ColumnLabel className="hidden px-1 sm:block">Flags</ColumnLabel>
            <ColumnLabel className="hidden sm:block">Note</ColumnLabel>
            <span />
          </div>
          {result.rounds.map((round, i) => (
            <RoundRow
              key={i}
              round={round}
              onChange={(patch) => updateRound(i, patch)}
              onDelete={() => deleteRound(i)}
            />
          ))}
          {result.rounds.length === 0 && (
            <p className="border-t border-[#2A272C] px-4 py-3 text-[13px] text-[#6B6870]">No rounds yet.</p>
          )}
        </ReportCard>
      </ReportSection>
    </div>
  )
}
