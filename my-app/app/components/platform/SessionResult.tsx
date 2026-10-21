'use client'

import type { ReactNode } from 'react'
import { Activity, MoveHorizontal, ShieldCheck, Stethoscope, UserRound, Zap } from 'lucide-react'
import type {
  AthleteSessionLog,
  AthleteBlock,
  AthleteExerciseLog,
  AthleteSetLog,
  CompetitionResult,
  SprintSession,
  PhysioSession,
} from '@/lib/types'
import { Tag } from '@/app/components/ui/tags'
import {
  ReportSection,
  ReportCard,
  ColumnLabel,
  PropertyLabel,
  SESSION_TYPES,
  INTENSITIES,
  READINESS_FEELS,
} from '@/app/components/platform/ReportSection'

const FONT = { fontFamily: "'DM Sans', sans-serif" }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(2)}s`
  const m = Math.floor(seconds / 60)
  const s = (seconds % 60).toFixed(2).padStart(5, '0')
  return `${m}:${s}`
}

function fmtWeight(set: AthleteSetLog): string | null {
  if (set.weight_type === 'bodyweight') return 'BW'
  if (set.weight_type === 'machine_level' && set.machine_level != null) return `Lvl ${set.machine_level}`
  if (set.weight_type === 'added' && set.added_weight_kg != null) return `+${set.added_weight_kg} kg`
  if (set.weight_kg != null) return `${set.weight_kg} kg`
  return null
}

const humanize = (v: string) => {
  const s = v.replace(/_/g, ' ')
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ─── Strength ─────────────────────────────────────────────────────────────────

// # · weight · result · effort · flags
const SET_GRID = 'grid items-center gap-x-3 grid-cols-[1.25rem_minmax(0,1fr)_minmax(0,1fr)_3rem_4.5rem]'

function SetRow({ set, metric }: { set: AthleteSetLog; metric: 'reps' | 'time' | 'distance' }) {
  const weight = fmtWeight(set)
  const result =
    metric === 'reps' ? set.reps
    : metric === 'time' ? (set.duration_seconds != null ? `${set.duration_seconds}s` : null)
    : (set.distance_m != null ? `${set.distance_m} m` : null)

  return (
    <div className="border-t border-[#2A272C] px-4 py-2" style={FONT}>
      <div className={SET_GRID}>
        <span className="text-[12px] tabular-nums text-[#6B6870]">
          {set.set_index != null ? set.set_index + 1 : '—'}
        </span>
        <span className="text-[13px] font-medium tabular-nums text-white">{weight ?? '—'}</span>
        <span className="text-[13px] tabular-nums text-[#E8E8E8]">{result ?? '—'}</span>
        <span className="text-[13px] tabular-nums text-[#847E89]">
          {set.effort_percent != null ? `${set.effort_percent}%` : ''}
        </span>
        <span className="flex justify-end gap-1">
          {set.is_warmup && <Tag size="sm">WU</Tag>}
          {set.is_failure && <Tag size="sm" variant="destructive">Fail</Tag>}
          {set.is_dropset && !set.is_failure && <Tag size="sm">Drop</Tag>}
        </span>
      </div>
      {set.notes && <p className="mt-1 pl-8 text-[12px] text-[#847E89]">{set.notes}</p>}
    </div>
  )
}

function ExerciseCard({ ex }: { ex: AthleteExerciseLog }) {
  // Summary — only show values that exist
  const summary: string[] = []
  if (ex.set_count != null) summary.push(`${ex.set_count} sets`)
  if (ex.total_reps != null) summary.push(`${ex.total_reps} reps`)
  if (ex.max_weight_kg != null) summary.push(`${ex.max_weight_kg} kg top`)
  if (ex.total_volume_kg != null) summary.push(`${(ex.total_volume_kg / 1000).toFixed(1)} t`)
  if ((ex as Record<string, unknown>).total_distance_m != null)
    summary.push(`${(ex as Record<string, unknown>).total_distance_m as number} m`)

  const metric: 'reps' | 'time' | 'distance' =
    ex.sets.some((s) => s.reps != null) ? 'reps'
    : ex.sets.some((s) => s.duration_seconds != null) ? 'time'
    : ex.sets.some((s) => s.distance_m != null) ? 'distance'
    : 'reps'

  return (
    <ReportCard>
      {/* Exercise header */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3" style={FONT}>
        <div className="min-w-0">
          <span className="text-[14px] font-semibold text-white" style={{ letterSpacing: '-0.01em' }}>
            {ex.name}
          </span>
          {ex.name_original && (
            <span className="ml-2 text-[12px] text-[#6B6870]">{ex.name_original}</span>
          )}
        </div>
        {summary.length > 0 && (
          <span className="text-[12px] tabular-nums text-[#847E89]">{summary.join(' · ')}</span>
        )}
        {ex.notes && <p className="basis-full text-[12px] text-[#847E89]">{ex.notes}</p>}
      </div>

      {/* Sets */}
      {ex.sets.length > 0 && (
        <>
          <div className={`${SET_GRID} border-t border-[#2A272C] px-4 pb-1.5 pt-2`}>
            <ColumnLabel className="px-0">#</ColumnLabel>
            <ColumnLabel className="px-0">Weight</ColumnLabel>
            <ColumnLabel className="px-0">{metric === 'reps' ? 'Reps' : metric === 'time' ? 'Time' : 'Distance'}</ColumnLabel>
            <ColumnLabel className="px-0">Effort</ColumnLabel>
            <span />
          </div>
          {ex.sets.map((s, i) => <SetRow key={i} set={s} metric={metric} />)}
        </>
      )}
    </ReportCard>
  )
}

function blockTitle(block: AthleteBlock): string {
  const parts = [block.block_name ?? (block.block_type ? humanize(block.block_type) : 'Exercises')]
  if (block.block_type === 'emom' && block.emom_interval_seconds) parts.push(`E${block.emom_interval_seconds / 60}MOM`)
  if (block.circuit_rounds != null) parts.push(`× ${block.circuit_rounds} rounds`)
  return parts.join(' · ')
}

function StrengthBlocks({ blocks }: { blocks: AthleteBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => (
        <ReportSection key={i} title={blockTitle(block)} count={block.exercises.length}>
          <div className="space-y-3">
            {block.exercises.map((ex, j) => <ExerciseCard key={j} ex={ex} />)}
          </div>
        </ReportSection>
      ))}
    </>
  )
}

// ─── Sprint ───────────────────────────────────────────────────────────────────

const REP_GRID = 'grid items-center gap-x-3 grid-cols-[1.25rem_5rem_minmax(0,1fr)_3rem]'

function SprintEfforts({ sprint }: { sprint: SprintSession }) {
  return (
    <ReportSection title="Efforts" count={sprint.efforts.length}>
      {(sprint.surface || sprint.footwear) && (
        <div className="flex flex-wrap gap-1.5">
          {sprint.surface && <PropertyLabel title="Surface">{sprint.surface}</PropertyLabel>}
          {sprint.footwear && <PropertyLabel title="Footwear">{sprint.footwear}</PropertyLabel>}
        </div>
      )}
      <div className="space-y-3">
        {sprint.efforts.map((effort, i) => (
          <ReportCard key={i}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-[12px] text-[#847E89]" style={FONT}>
              <PropertyLabel icon={<Zap />} title="Drill type">{humanize(effort.drill_type)}</PropertyLabel>
              {effort.distance_m != null && <span className="tabular-nums text-[#E8E8E8]">{effort.distance_m} m</span>}
              {effort.effort_percent != null && <span className="tabular-nums">@ {effort.effort_percent}%</span>}
              {effort.rest_between_reps_seconds != null && (
                <span className="tabular-nums">{effort.rest_between_reps_seconds}s rest</span>
              )}
            </div>
            <div className={`${REP_GRID} border-t border-[#2A272C] px-4 pb-1.5 pt-2`}>
              <ColumnLabel className="px-0">#</ColumnLabel>
              <ColumnLabel className="px-0">Time</ColumnLabel>
              <ColumnLabel className="px-0">Splits</ColumnLabel>
              <span />
            </div>
            {effort.reps.map((rep, j) => (
              <div key={j} className={`${REP_GRID} border-t border-[#2A272C] px-4 py-2 text-[13px]`} style={FONT}>
                <span className="text-[12px] tabular-nums text-[#6B6870]">{rep.rep_index + 1}</span>
                <span className="font-medium tabular-nums text-white">
                  {rep.time_seconds != null ? fmtTime(rep.time_seconds) : '—'}
                </span>
                <span className="truncate tabular-nums text-[#847E89]">
                  {rep.split_times_seconds?.length ? rep.split_times_seconds.join(' · ') : ''}
                </span>
                <span>{rep.completed === false && <Tag size="sm" variant="destructive">DNF</Tag>}</span>
              </div>
            ))}
            {effort.notes && (
              <p className="border-t border-[#2A272C] px-4 py-2 text-[12px] text-[#847E89]" style={FONT}>{effort.notes}</p>
            )}
          </ReportCard>
        ))}
      </div>
    </ReportSection>
  )
}

// ─── Competition ──────────────────────────────────────────────────────────────

const ROUND_GRID = 'grid items-center gap-x-3 grid-cols-[minmax(0,1fr)_5rem_3.5rem_3rem_3rem]'

function CompetitionResultView({ result }: { result: CompetitionResult }) {
  const subtitle = [result.competition_name, result.venue, result.lane != null ? `Lane ${result.lane}` : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <ReportSection title="Competition">
      <div className="flex flex-wrap items-end justify-between gap-4" style={FONT}>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {result.event && <span className="text-[18px] font-semibold text-white">{result.event}</span>}
            <Tag size="sm" variant={result.status === 'completed' ? 'secondary' : 'destructive'}>
              {result.status === 'completed' ? 'Completed' : result.status.toUpperCase()}
            </Tag>
          </div>
          {subtitle && <p className="mt-1 text-[13px] text-[#847E89]">{subtitle}</p>}
          {result.dns_reason && <p className="mt-1 text-[12px] text-[#FF4D4D]">DNS reason: {result.dns_reason}</p>}
        </div>
        {result.best_time_seconds != null && (
          <div className="text-right">
            <p className="nh-label text-[#6B6870]">Best</p>
            <p className="text-[22px] font-semibold tabular-nums text-white">{fmtTime(result.best_time_seconds)}</p>
          </div>
        )}
      </div>

      {result.rounds.length > 0 && (
        <ReportCard>
          <div className={`${ROUND_GRID} px-4 pb-1.5 pt-2`}>
            <ColumnLabel className="px-0">Round</ColumnLabel>
            <ColumnLabel className="px-0">Time</ColumnLabel>
            <ColumnLabel className="px-0">Wind</ColumnLabel>
            <ColumnLabel className="px-0">Rank</ColumnLabel>
            <span />
          </div>
          {result.rounds.map((round, i) => (
            <div key={i} className="border-t border-[#2A272C] px-4 py-2 text-[13px]" style={FONT}>
              <div className={ROUND_GRID}>
                <span className="text-[#E8E8E8]">
                  {humanize(round.round_type)}
                  {round.relay_leg != null && <span className="ml-1 text-[#6B6870]">Leg {round.relay_leg}</span>}
                </span>
                <span className="font-medium tabular-nums text-white">
                  {round.time_seconds != null ? fmtTime(round.time_seconds) : '—'}
                </span>
                <span className="tabular-nums text-[#847E89]">{round.wind_ms != null ? round.wind_ms : ''}</span>
                <span className="tabular-nums text-[#847E89]">{round.ranking != null ? `#${round.ranking}` : ''}</span>
                <span className="flex justify-end gap-1">
                  {round.pb && <Tag size="sm" variant="green">PB</Tag>}
                  {round.sb && !round.pb && <Tag size="sm">SB</Tag>}
                </span>
              </div>
              {round.notes && <p className="mt-1 text-[12px] text-[#847E89]">{round.notes}</p>}
            </div>
          ))}
        </ReportCard>
      )}

      {(result.conditions || result.notes) && (
        <p className="text-[13px] leading-relaxed text-[#A09EA3]" style={FONT}>
          {[result.conditions, result.notes].filter(Boolean).join(' — ')}
        </p>
      )}
    </ReportSection>
  )
}

// ─── Physio ───────────────────────────────────────────────────────────────────

function PhysioView({ physio }: { physio: PhysioSession }) {
  return (
    <>
      <ReportSection title="Physio">
        {(physio.provider || physio.clearance_status) && (
          <div className="flex flex-wrap gap-1.5">
            {physio.provider && (
              <PropertyLabel icon={<UserRound />} title="Provider">{humanize(physio.provider)}</PropertyLabel>
            )}
            {physio.clearance_status && (
              <PropertyLabel icon={<ShieldCheck />} title="Clearance">{humanize(physio.clearance_status)}</PropertyLabel>
            )}
          </div>
        )}
        {physio.notes && (
          <p className="text-[14px] leading-relaxed text-[#E8E8E8]" style={FONT}>{physio.notes}</p>
        )}
        {physio.body_areas && physio.body_areas.length > 0 && (
          <ReportCard>
            {physio.body_areas.map((area, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#2A272C] px-4 py-2.5 text-[13px] first:border-t-0"
                style={FONT}
              >
                <span className="flex items-center gap-1.5 font-medium text-white">
                  <Stethoscope size={14} className="text-[#847E89]" />
                  {humanize(area.area)}
                </span>
                {area.side && (
                  <span className="flex items-center gap-1 text-[12px] text-[#847E89]">
                    <MoveHorizontal size={12} /> {humanize(area.side)}
                  </span>
                )}
                {area.injury_name && <Tag size="sm" variant="destructive">{area.injury_name}</Tag>}
                {area.treatment_type && <span className="text-[12px] text-[#847E89]">{area.treatment_type}</span>}
                {(area.pain_score_before != null || area.pain_score_after != null) && (
                  <span className="ml-auto flex items-center gap-1 text-[12px] tabular-nums text-[#A09EA3]">
                    <Activity size={12} className="text-[#847E89]" />
                    {area.pain_score_before ?? '?'} → {area.pain_score_after ?? '?'}
                  </span>
                )}
              </div>
            ))}
          </ReportCard>
        )}
      </ReportSection>

      {physio.exercises && physio.exercises.length > 0 && (
        <ReportSection title="Rehab exercises" count={physio.exercises.length}>
          <div className="space-y-3">
            {physio.exercises.map((ex, i) => <ExerciseCard key={i} ex={ex} />)}
          </div>
        </ReportSection>
      )}
    </>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface SessionResultProps {
  session: AthleteSessionLog
  /** Rendered on the right of the "AI report" section header (e.g. an Edit button) */
  action?: ReactNode
}

export function SessionResult({ session, action }: SessionResultProps) {
  const { summary } = session
  const intensity = summary.estimated_intensity ?? session.perceived_intensity
  const type = SESSION_TYPES.find((t) => t.value === session.session_type)
  const intensityOpt = INTENSITIES.find((o) => o.value === intensity)
  const feel = READINESS_FEELS.find((o) => o.value === session.readiness?.feel)
  const pain = session.readiness?.pain_score

  const stats: { label: string; value: string }[] = []
  if (summary.total_sets != null) stats.push({ label: 'Sets', value: String(summary.total_sets) })
  if (summary.total_reps != null) stats.push({ label: 'Reps', value: String(summary.total_reps) })
  if (summary.total_volume_kg != null) stats.push({ label: 'Volume', value: `${(summary.total_volume_kg / 1000).toFixed(1)} t` })
  if (summary.total_distance_m != null) stats.push({ label: 'Distance', value: `${(summary.total_distance_m / 1000).toFixed(2)} km` })

  return (
    <div className="space-y-10">
      <ReportSection title="AI report" action={action}>
        {/* Properties */}
        <div className="flex flex-wrap gap-1.5">
          {type && <PropertyLabel icon={type.icon} title="Session type">{type.label}</PropertyLabel>}
          {intensityOpt && <PropertyLabel icon={intensityOpt.icon} title="Intensity">{intensityOpt.label}</PropertyLabel>}
          {feel && <PropertyLabel icon={feel.icon} title="Readiness">{feel.label}</PropertyLabel>}
          {pain != null && <PropertyLabel icon={<Activity />} title="Pain score">Pain {pain}/10</PropertyLabel>}
        </div>

        {/* Summary notes */}
        {summary.session_notes && (
          <p className="text-[14px] leading-relaxed text-[#E8E8E8]" style={FONT}>{summary.session_notes}</p>
        )}
        {session.readiness?.notes && (
          <p className="text-[13px] text-[#847E89]" style={FONT}>{session.readiness.notes}</p>
        )}

        {/* Stats */}
        {stats.length > 0 && (
          <ReportCard>
            <div className="grid divide-x divide-[#2A272C]" style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}>
              {stats.map((s) => (
                <div key={s.label} className="px-4 py-3">
                  <p className="nh-label text-[#6B6870]">{s.label}</p>
                  <p className="mt-0.5 text-[18px] font-semibold tabular-nums text-white" style={FONT}>{s.value}</p>
                </div>
              ))}
            </div>
          </ReportCard>
        )}
      </ReportSection>

      {/* Strength / conditioning / recovery / mixed blocks */}
      {session.blocks && session.blocks.length > 0 && <StrengthBlocks blocks={session.blocks} />}

      {/* Sprint */}
      {session.sprint_session && <SprintEfforts sprint={session.sprint_session} />}

      {/* Competition */}
      {session.competition_result && <CompetitionResultView result={session.competition_result} />}

      {/* Physio / Rehab / Prehab */}
      {session.physio_session && <PhysioView physio={session.physio_session} />}
    </div>
  )
}
