'use client'

import type {
  AthleteSessionLog,
  AthleteBlock,
  AthleteExerciseLog,
  AthleteSetLog,
  CompetitionResult,
  SprintSession,
  PhysioSession,
  SessionType,
  PerceivedIntensity,
} from '@/lib/types'
import { PillTag } from '@/app/components/ui/tags'

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

function sessionTypeLabel(type: SessionType): string {
  const labels: Record<SessionType, string> = {
    strength: 'Strength', sprint: 'Sprint', conditioning: 'Conditioning',
    competition: 'Competition', physio: 'Physio', rehab: 'Rehab',
    prehab: 'Prehab', recovery: 'Recovery', mixed: 'Mixed', unknown: 'Unknown',
  }
  return labels[type] ?? type
}

function intensityColor(intensity: PerceivedIntensity | null | undefined): string {
  switch (intensity) {
    case 'max':  return '#FF4D4D'
    case 'high': return '#C8F04D'
    case 'moderate': return '#A09EA3'
    case 'low': return '#6B6870'
    default: return '#6B6870'
  }
}

// ─── Sub-views ────────────────────────────────────────────────────────────────

function SetRow({ set }: { set: AthleteSetLog }) {
  const weight = fmtWeight(set)
  const parts: string[] = []
  if (set.reps != null) parts.push(`${set.reps} reps`)
  else if (set.duration_seconds != null) parts.push(`${set.duration_seconds}s`)
  if (weight) parts.push(weight)
  if (set.distance_m != null) parts.push(`${set.distance_m}m`)
  if (set.effort_percent != null) parts.push(`${set.effort_percent}%`)

  return (
    <div className="flex items-center justify-between py-1 text-[12px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <span className="text-[#6B6870]">
        Set {set.set_index + 1}{set.is_warmup ? ' (WU)' : ''}{set.is_failure ? ' ✗' : ''}
      </span>
      <span className="text-[#A09EA3]">{parts.join(' · ') || '—'}</span>
      {set.notes && <span className="text-[#6B6870] italic ml-2">{set.notes}</span>}
    </div>
  )
}

function ExerciseCard({ ex }: { ex: AthleteExerciseLog }) {
  const hasMetrics = ex.max_weight_kg != null || ex.total_volume_kg != null || ex.total_reps != null

  return (
    <div className="border-t border-[#3A373C] pt-3 mt-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[13px] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {ex.name}
          </span>
          {ex.name_original && (
            <span className="text-[11px] text-[#6B6870] ml-2">({ex.name_original})</span>
          )}
        </div>
        {hasMetrics && (
          <div className="text-right flex-shrink-0">
            {ex.max_weight_kg != null && (
              <span className="text-[12px] text-[#A09EA3]">{ex.max_weight_kg} kg</span>
            )}
            {ex.total_volume_kg != null && (
              <span className="text-[11px] text-[#6B6870] ml-2">{ex.total_volume_kg.toLocaleString()} kg vol</span>
            )}
          </div>
        )}
      </div>
      {ex.notes && (
        <p className="text-[11px] text-[#6B6870] italic mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {ex.notes}
        </p>
      )}
      <div className="mt-1 space-y-0">
        {ex.sets.map((s, i) => <SetRow key={i} set={s} />)}
      </div>
    </div>
  )
}

function StrengthBlocks({ blocks }: { blocks: AthleteBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => (
        <div key={i}>
          {block.block_name && (
            <p
              className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D] mb-3"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {block.block_name}
              {block.block_type === 'emom' && block.emom_interval_seconds && (
                <span className="text-[#6B6870] ml-2">E{block.emom_interval_seconds / 60}MOM</span>
              )}
              {block.circuit_rounds != null && (
                <span className="text-[#6B6870] ml-2">× {block.circuit_rounds} rounds</span>
              )}
            </p>
          )}
          {block.exercises.map((ex, i) => (
            <ExerciseCard key={i} ex={ex} />
          ))}
        </div>
      ))}
    </div>
  )
}

function SprintEfforts({ sprint }: { sprint: SprintSession }) {
  return (
    <div className="space-y-4">
      {sprint.surface && (
        <p className="text-[12px] text-[#6B6870]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Surface: <span className="text-[#A09EA3]">{sprint.surface}</span>
          {sprint.footwear && <> · Footwear: <span className="text-[#A09EA3]">{sprint.footwear}</span></>}
        </p>
      )}
      {sprint.efforts.map((effort, i) => (
        <div key={i} className="border border-[#3A373C] bg-[#1A1719] p-4">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {effort.drill_type.replace(/_/g, ' ')}
            </span>
            {effort.distance_m != null && (
              <span className="text-[12px] text-[#A09EA3]">{effort.distance_m}m</span>
            )}
            {effort.effort_percent != null && (
              <span className="text-[12px] text-[#6B6870]">@ {effort.effort_percent}%</span>
            )}
          </div>
          <div className="space-y-1">
            {effort.reps.map((rep, i) => (
              <div key={i} className="flex items-center justify-between text-[12px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <span className="text-[#6B6870]">Rep {rep.rep_index + 1}</span>
                <div className="flex items-center gap-3">
                  {rep.time_seconds != null && (
                    <span className="text-white font-medium">{fmtTime(rep.time_seconds)}</span>
                  )}
                  {rep.split_times_seconds && rep.split_times_seconds.length > 0 && (
                    <span className="text-[#6B6870]">[{rep.split_times_seconds.join(' · ')}]</span>
                  )}
                  {!rep.completed && <span className="text-[#FF4D4D] text-[11px]">DNF</span>}
                </div>
              </div>
            ))}
          </div>
          {effort.notes && (
            <p className="text-[11px] text-[#6B6870] italic mt-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {effort.notes}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function CompetitionResultView({ result }: { result: CompetitionResult }) {
  const statusColor: Record<string, string> = {
    completed: '#C8F04D',
    dns: '#FF4D4D',
    dnf: '#FF4D4D',
    dq: '#FF4D4D',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        {result.event && (
          <span className="text-[20px] font-semibold text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            {result.event}
          </span>
        )}
        {result.competition_name && (
          <span className="text-[13px] text-[#6B6870]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {result.competition_name}
          </span>
        )}
        <span
          className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: statusColor[result.status] ?? '#A09EA3', fontFamily: "'Inter', sans-serif" }}
        >
          {result.status}
        </span>
      </div>

      {result.dns_reason && (
        <p className="text-[12px] text-[#FF4D4D]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          DNS reason: {result.dns_reason}
        </p>
      )}

      {result.rounds.length > 0 && (
        <div className="border border-[#3A373C] overflow-hidden">
          <table className="w-full text-[12px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <thead>
              <tr className="bg-[#1E1B1F]">
                <th className="text-left px-4 py-2 text-[#6B6870] font-medium">Round</th>
                <th className="text-right px-4 py-2 text-[#6B6870] font-medium">Time</th>
                <th className="text-right px-4 py-2 text-[#6B6870] font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A373C]">
              {result.rounds.map((round, i) => (
                <tr key={i} className="bg-[#1A1719]">
                  <td className="px-4 py-2 capitalize text-[#A09EA3]">
                    {round.round_type}
                    {round.relay_leg != null && <span className="text-[#6B6870] ml-1">Leg {round.relay_leg}</span>}
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-white">
                    {round.time_seconds != null ? fmtTime(round.time_seconds) : '—'}
                    {round.pb && <span className="ml-2 text-[#C8F04D] text-[10px] font-bold">PB</span>}
                    {round.sb && !round.pb && <span className="ml-2 text-[#A09EA3] text-[10px] font-bold">SB</span>}
                  </td>
                  <td className="px-4 py-2 text-right text-[#6B6870] italic">{round.notes ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result.best_time_seconds != null && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#6B6870]" style={{ fontFamily: "'Inter', sans-serif" }}>
            Best
          </span>
          <span className="text-[18px] font-semibold text-[#C8F04D]" style={{ fontFamily: "'Inter', sans-serif" }}>
            {fmtTime(result.best_time_seconds)}
          </span>
        </div>
      )}

      {result.notes && (
        <p className="text-[12px] text-[#6B6870] italic" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {result.notes}
        </p>
      )}
    </div>
  )
}

function PhysioView({ physio }: { physio: PhysioSession }) {
  const clearanceColors: Record<string, string> = {
    cleared: '#C8F04D',
    modified_training: '#A09EA3',
    rest_only: '#FF4D4D',
    pending_review: '#6B6870',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        {physio.provider && (
          <span className="text-[12px] text-[#6B6870] capitalize" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {physio.provider}
          </span>
        )}
        {physio.clearance_status && (
          <span
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: clearanceColors[physio.clearance_status] ?? '#A09EA3', fontFamily: "'Inter', sans-serif" }}
          >
            {physio.clearance_status.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      {physio.body_areas && physio.body_areas.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D]" style={{ fontFamily: "'Inter', sans-serif" }}>
            Areas
          </p>
          {physio.body_areas.map((area, i) => (
            <div key={i} className="flex items-start gap-3 text-[12px] border-t border-[#3A373C] pt-2">
              <span className="text-white capitalize" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {area.side && area.side !== 'bilateral' ? `${area.side} ` : ''}{area.area}
              </span>
              {area.injury_name && (
                <span className="text-[#FF4D4D]">{area.injury_name}</span>
              )}
              {area.treatment_type && (
                <span className="text-[#6B6870] italic">{area.treatment_type}</span>
              )}
              {(area.pain_score_before != null || area.pain_score_after != null) && (
                <span className="text-[#6B6870] ml-auto">
                  Pain: {area.pain_score_before ?? '?'} → {area.pain_score_after ?? '?'}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {physio.exercises && physio.exercises.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D] mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            Exercises
          </p>
          {physio.exercises.map((ex, i) => <ExerciseCard key={i} ex={ex} />)}
        </div>
      )}

      {physio.notes && (
        <p className="text-[12px] text-[#6B6870] italic" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {physio.notes}
        </p>
      )}
    </div>
  )
}

function ParserWarnings({ warnings }: { warnings: string[] }) {
  if (!warnings.length) return null
  return (
    <div className="border border-[#3A373C] bg-[#1E1B1F] p-3 mt-4">
      <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#A09EA3] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
        Parser Warnings
      </p>
      <ul className="space-y-1">
        {warnings.map((w, i) => (
          <li key={i} className="text-[11px] text-[#6B6870]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            • {w}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Stat bar ─────────────────────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center px-3 py-2 border border-[#3A373C] bg-[#1E1B1F] min-w-[64px]">
      <span className="text-[18px] font-semibold text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
        {value}
      </span>
      <span className="text-[10px] text-[#6B6870] uppercase tracking-widest mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
        {label}
      </span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface SessionResultProps {
  session: AthleteSessionLog
}

export function SessionResult({ session }: SessionResultProps) {
  const { summary } = session
  const intensity = summary.estimated_intensity ?? session.perceived_intensity

  const stats: { label: string; value: string }[] = []
  if (summary.total_sets != null) stats.push({ label: 'Sets', value: String(summary.total_sets) })
  if (summary.total_reps != null) stats.push({ label: 'Reps', value: String(summary.total_reps) })
  if (summary.total_volume_kg != null) stats.push({ label: 'Volume', value: `${(summary.total_volume_kg / 1000).toFixed(1)}t` })
  if (summary.total_distance_m != null) stats.push({ label: 'Dist', value: `${(summary.total_distance_m / 1000).toFixed(2)} km` })

  const confidence = summary.parser_confidence ?? 1
  const confidencePct = Math.round(confidence * 100)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <PillTag label={sessionTypeLabel(session.session_type)} variant="ghost-green" />
          {session.session_subtype && (
            <PillTag label={session.session_subtype} variant="ghost-dark" />
          )}
          {session.duration_minutes != null && (
            <PillTag label={`${session.duration_minutes} min`} variant="ghost-dark" />
          )}
        </div>
        {intensity && (
          <span
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: intensityColor(intensity), fontFamily: "'Inter', sans-serif" }}
          >
            {intensity}
          </span>
        )}
      </div>

      {/* Summary notes */}
      {summary.session_notes && (
        <p className="text-[13px] text-[#6B6870] leading-relaxed italic" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {summary.session_notes}
        </p>
      )}

      {/* Stat pills */}
      {stats.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {stats.map((s) => <StatPill key={s.label} label={s.label} value={s.value} />)}
        </div>
      )}

      {/* Readiness */}
      {session.readiness && (session.readiness.feel || session.readiness.pain_score != null) && (
        <div className="flex items-center gap-3 text-[12px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <span className="text-[#6B6870]">Readiness:</span>
          {session.readiness.feel && (
            <span className="text-[#A09EA3] capitalize">{session.readiness.feel}</span>
          )}
          {session.readiness.pain_score != null && (
            <span className="text-[#A09EA3]">Pain {session.readiness.pain_score}/10</span>
          )}
          {session.readiness.notes && (
            <span className="text-[#6B6870] italic">{session.readiness.notes}</span>
          )}
        </div>
      )}

      <div className="border-t border-[#3A373C]" />

      {/* Strength / conditioning / recovery / mixed blocks */}
      {session.blocks && session.blocks.length > 0 && (
        <StrengthBlocks blocks={session.blocks} />
      )}

      {/* Sprint */}
      {session.sprint_session && (
        <SprintEfforts sprint={session.sprint_session} />
      )}

      {/* Competition */}
      {session.competition_result && (
        <CompetitionResultView result={session.competition_result} />
      )}

      {/* Physio / Rehab / Prehab */}
      {session.physio_session && (
        <PhysioView physio={session.physio_session} />
      )}

      {/* Parser confidence + warnings */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px] text-[#6B6870]" style={{ fontFamily: "'Inter', sans-serif" }}>
          AI confidence:
        </span>
        <span
          className="text-[10px] font-semibold"
          style={{
            fontFamily: "'Inter', sans-serif",
            color: confidence >= 0.8 ? '#C8F04D' : confidence >= 0.6 ? '#A09EA3' : '#FF4D4D',
          }}
        >
          {confidencePct}%
        </span>
        <span className="text-[10px] text-[#3A373C]">v{session.parser_version}</span>
      </div>

      {summary.parsing_warnings && summary.parsing_warnings.length > 0 && (
        <ParserWarnings warnings={summary.parsing_warnings} />
      )}
    </div>
  )
}
