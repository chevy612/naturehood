'use client'

import type { SessionDetailsRow, SessionType, PerceivedIntensity } from '@/lib/types'

const SESSION_TYPES: { value: SessionType; label: string }[] = [
  { value: 'strength',     label: 'Strength' },
  { value: 'sprint',       label: 'Sprint' },
  { value: 'conditioning', label: 'Conditioning' },
  { value: 'competition',  label: 'Competition' },
  { value: 'physio',       label: 'Physio' },
  { value: 'rehab',        label: 'Rehab' },
  { value: 'recovery',     label: 'Recovery' },
  { value: 'mixed',        label: 'Mixed' },
]

const INTENSITIES: { value: PerceivedIntensity; label: string }[] = [
  { value: 'low',      label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high',     label: 'High' },
  { value: 'max',      label: 'Max' },
]

const READINESS_FEELS = ['good', 'great', 'tired', 'sore'] as const

type Props = {
  details: Partial<SessionDetailsRow>
  onChange: (patch: Partial<SessionDetailsRow>) => void
}

export default function SessionMetaPanel({ details, onChange }: Props) {
  return (
    <div className="space-y-6">

      {/* Session type */}
      <div>
        <p
          className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D] mb-3"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Session Type
        </p>
        <div className="flex flex-wrap gap-2">
          {SESSION_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ session_type: value })}
              className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] border transition-colors duration-150 ${
                details.session_type === value
                  ? 'bg-[#C8F04D] border-[#C8F04D] text-[#141115]'
                  : 'border-[#3A373C] text-[#6B6870] hover:border-[#C8F04D]/50 hover:text-[#A09EA3]'
              }`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Perceived intensity */}
      <div>
        <p
          className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D] mb-3"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Intensity
        </p>
        <div className="flex flex-wrap gap-2">
          {INTENSITIES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ perceived_intensity: details.perceived_intensity === value ? null : value })}
              className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] border transition-colors duration-150 ${
                details.perceived_intensity === value
                  ? 'bg-[#C8F04D] border-[#C8F04D] text-[#141115]'
                  : 'border-[#3A373C] text-[#6B6870] hover:border-[#C8F04D]/50 hover:text-[#A09EA3]'
              }`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Readiness */}
      <div>
        <p
          className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D] mb-3"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Readiness
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {READINESS_FEELS.map((feel) => (
            <button
              key={feel}
              type="button"
              onClick={() => onChange({ readiness_feel: details.readiness_feel === feel ? null : feel })}
              className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] border transition-colors duration-150 ${
                details.readiness_feel === feel
                  ? 'bg-[#C8F04D] border-[#C8F04D] text-[#141115]'
                  : 'border-[#3A373C] text-[#6B6870] hover:border-[#C8F04D]/50 hover:text-[#A09EA3]'
              }`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {feel}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <label
            className="text-[12px] text-[#6B6870] shrink-0 w-24"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Pain score
          </label>
          <input
            type="number"
            min={0}
            max={10}
            value={details.readiness_pain_score ?? ''}
            placeholder="0–10"
            onChange={(e) =>
              onChange({
                readiness_pain_score: e.target.value === '' ? null : Math.min(10, Math.max(0, Number(e.target.value))),
              })
            }
            className="w-20 bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-white text-[13px] px-3 py-2 transition-colors duration-150 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
      </div>

      {/* Session notes */}
      <div>
        <p
          className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D] mb-3"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Session Notes
        </p>
        <textarea
          value={details.session_notes ?? ''}
          onChange={(e) => onChange({ session_notes: e.target.value || null })}
          placeholder="AI summary or your own notes…"
          rows={3}
          className="w-full bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-white text-[13px] p-3 placeholder-[#3A373C] transition-colors duration-150 resize-none leading-relaxed"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        />
      </div>

      {/* Parser confidence (read-only) */}
      {details.parser_confidence != null && (
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#6B6870]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Parser confidence
          </span>
          <span
            className={`text-[11px] font-semibold ${
              details.parser_confidence >= 0.8 ? 'text-[#C8F04D]' :
              details.parser_confidence >= 0.6 ? 'text-[#A09EA3]' : 'text-[#FF4D4D]'
            }`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {Math.round(details.parser_confidence * 100)}%
          </span>
          {details.parser_version && (
            <span className="text-[10px] text-[#3A373C]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              v{details.parser_version}
            </span>
          )}
        </div>
      )}

      {/* Parsing warnings (read-only) */}
      {details.parsing_warnings && details.parsing_warnings.length > 0 && (
        <div className="border border-[#3A373C] p-3 space-y-1">
          {details.parsing_warnings.map((w, i) => (
            <p key={i} className="text-[12px] text-[#A09EA3]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {w}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
