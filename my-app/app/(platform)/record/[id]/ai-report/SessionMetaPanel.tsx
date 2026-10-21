'use client'

import {
  Dumbbell, Zap, HeartPulse, Trophy, Stethoscope, Bandage, Waves, Shuffle,
  SignalLow, SignalMedium, SignalHigh, Signal, Gauge,
  Laugh, Smile, BatteryLow, Frown, Activity, Sparkles, TriangleAlert,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { SessionDetailsRow, SessionType, PerceivedIntensity } from '@/lib/types'
import { ButtonPropertySelect } from '@/app/components/ui/buttons'
import { TextAreaInline } from '@/app/components/ui/inputs'

const SESSION_TYPES: { value: SessionType; label: string; icon: ReactNode }[] = [
  { value: 'strength',     label: 'Strength',     icon: <Dumbbell /> },
  { value: 'sprint',       label: 'Sprint',       icon: <Zap /> },
  { value: 'conditioning', label: 'Conditioning', icon: <HeartPulse /> },
  { value: 'competition',  label: 'Competition',  icon: <Trophy /> },
  { value: 'physio',       label: 'Physio',       icon: <Stethoscope /> },
  { value: 'rehab',        label: 'Rehab',        icon: <Bandage /> },
  { value: 'recovery',     label: 'Recovery',     icon: <Waves /> },
  { value: 'mixed',        label: 'Mixed',        icon: <Shuffle /> },
]

const INTENSITIES: { value: PerceivedIntensity; label: string; icon: ReactNode }[] = [
  { value: 'low',      label: 'Low',      icon: <SignalLow /> },
  { value: 'moderate', label: 'Moderate', icon: <SignalMedium /> },
  { value: 'high',     label: 'High',     icon: <SignalHigh /> },
  { value: 'max',      label: 'Max',      icon: <Signal /> },
]

const READINESS_FEELS = [
  { value: 'great', label: 'Great', icon: <Laugh /> },
  { value: 'good',  label: 'Good',  icon: <Smile /> },
  { value: 'tired', label: 'Tired', icon: <BatteryLow /> },
  { value: 'sore',  label: 'Sore',  icon: <Frown /> },
] as const

const PAIN_SCORES = Array.from({ length: 11 }, (_, n) => ({
  value: String(n),
  label: `Pain ${n}/10`,
  icon: <Activity />,
}))

type Props = {
  details: Partial<SessionDetailsRow>
  onChange: (patch: Partial<SessionDetailsRow>) => void
}

// Linear-style property chips — rendered directly under the workout title
export function SessionProperties({ details, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <ButtonPropertySelect
        label="Session type"
        options={SESSION_TYPES}
        value={details.session_type}
        onChange={(v) => v && onChange({ session_type: v })}
      />
      <ButtonPropertySelect
        label="Intensity"
        options={INTENSITIES}
        value={details.perceived_intensity}
        onChange={(v) => onChange({ perceived_intensity: v })}
        icon={<Gauge />}
        allowClear
      />
      <ButtonPropertySelect
        label="Readiness"
        options={READINESS_FEELS}
        value={details.readiness_feel}
        onChange={(v) => onChange({ readiness_feel: v })}
        icon={<Smile />}
        allowClear
      />
      <ButtonPropertySelect
        label="Pain score"
        options={PAIN_SCORES}
        value={details.readiness_pain_score != null ? String(details.readiness_pain_score) : null}
        onChange={(v) => onChange({ readiness_pain_score: v == null ? null : Number(v) })}
        icon={<Activity />}
        placeholder="Pain"
        allowClear
      />
    </div>
  )
}

// Session notes as the page "description", plus AI parse confidence + warnings
export default function SessionMetaPanel({ details, onChange }: Props) {
  const confidence = details.parser_confidence
  const warnings = details.parsing_warnings ?? []
  const pct = confidence != null ? Math.round(confidence * 100) : null
  const tone = pct == null ? '#6B6870' : pct >= 80 ? '#E8E8E8' : pct >= 60 ? '#A09EA3' : '#FF4D4D'

  return (
    <div className="space-y-4">
      <TextAreaInline
        value={details.session_notes}
        onValueChange={(v) => onChange({ session_notes: v || null })}
        placeholder="Add session notes…"
        ariaLabel="Session notes"
        className="-mx-2 w-[calc(100%+1rem)]"
      />

      {(pct != null || warnings.length > 0) && (
        <div
          className="rounded-lg border border-[#2A272C] bg-[#1A1719] px-3 py-2.5"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <div className="flex items-center gap-2 text-[12px] text-[#A09EA3]">
            <Sparkles size={14} className="shrink-0 text-[#847E89]" />
            <span>Structured by AI — check the details below before saving.</span>
            {pct != null && (
              <span className="ml-auto flex shrink-0 items-center gap-2">
                <span className="hidden h-1 w-16 overflow-hidden rounded-full bg-[#2B282C] sm:block">
                  <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: tone }} />
                </span>
                <span className="tabular-nums font-medium" style={{ color: tone }}>{pct}%</span>
                {details.parser_version && (
                  <span className="text-[11px] text-[#6B6870]">v{details.parser_version}</span>
                )}
              </span>
            )}
          </div>
          {warnings.length > 0 && (
            <ul className="mt-2 space-y-1 border-t border-[#2A272C] pt-2">
              {warnings.map((w, i) => (
                <li key={i} className="flex gap-2 text-[12px] leading-snug text-[#A09EA3]">
                  <TriangleAlert size={13} className="mt-px shrink-0 text-[#F0B429]" />
                  {w}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
