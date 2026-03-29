'use client'

import { Plus, X } from 'lucide-react'
import type { PhysioBodyAreaRow, SessionDetailsRow } from '@/lib/types'
import StrengthPanel, { type DraftBlock } from './StrengthPanel'

export type DraftBodyArea = Omit<PhysioBodyAreaRow, 'id' | 'training_log_id' | 'user_id'>

const SIDES = ['left', 'right', 'bilateral'] as const
const PROVIDERS = ['physiotherapist', 'coach', 'self'] as const
const CLEARANCE_STATUSES = [
  { value: 'cleared',          label: 'Cleared' },
  { value: 'modified_training', label: 'Modified' },
  { value: 'rest_only',        label: 'Rest Only' },
  { value: 'pending_review',   label: 'Pending Review' },
] as const

function blankArea(area_index: number): DraftBodyArea {
  return {
    area_index,
    area: '',
    side: null,
    injury_name: null,
    pain_score_before: null,
    pain_score_after: null,
    treatment_type: null,
  }
}

// ── Body area card ────────────────────────────────────────────────────────────

function BodyAreaCard({
  area,
  onChange,
  onDelete,
}: {
  area: DraftBodyArea
  onChange: (patch: Partial<DraftBodyArea>) => void
  onDelete: () => void
}) {
  const num = (v: string, max = 10) =>
    v === '' ? null : Math.min(max, Math.max(0, Number(v)))

  return (
    <div className="border border-[#3A373C] bg-[#1A1719] p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-3">
          {/* Area name */}
          <input
            type="text"
            value={area.area}
            onChange={(e) => onChange({ area: e.target.value })}
            placeholder="Body area (e.g. left hamstring)"
            className="w-full bg-transparent outline-none text-[13px] font-semibold text-white placeholder-[#3A373C] border-b border-[#3A373C] focus:border-[#C8F04D] pb-1 transition-colors"
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em' }}
          />

          {/* Side */}
          <div className="flex gap-1.5">
            {SIDES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ side: area.side === s ? null : s })}
                className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] border transition-colors ${
                  area.side === s
                    ? 'bg-[#C8F04D] border-[#C8F04D] text-[#141115]'
                    : 'border-[#3A373C] text-[#6B6870] hover:border-[#6B6870]'
                }`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Pain scores + treatment */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#6B6870]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Pain before</span>
              <input
                type="number"
                min={0}
                max={10}
                value={area.pain_score_before ?? ''}
                placeholder="0–10"
                onChange={(e) => onChange({ pain_score_before: num(e.target.value) })}
                className="w-14 bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-[12px] text-white px-2 py-1 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#6B6870]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Pain after</span>
              <input
                type="number"
                min={0}
                max={10}
                value={area.pain_score_after ?? ''}
                placeholder="0–10"
                onChange={(e) => onChange({ pain_score_after: num(e.target.value) })}
                className="w-14 bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-[12px] text-white px-2 py-1 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#6B6870] shrink-0" style={{ fontFamily: "'DM Sans', sans-serif" }}>Injury</span>
            <input
              type="text"
              value={area.injury_name ?? ''}
              placeholder="e.g. hamstring strain"
              onChange={(e) => onChange({ injury_name: e.target.value || null })}
              className="flex-1 bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-[12px] text-white px-2 py-1 transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#6B6870] shrink-0" style={{ fontFamily: "'DM Sans', sans-serif" }}>Treatment</span>
            <input
              type="text"
              value={area.treatment_type ?? ''}
              placeholder="e.g. dry needling, massage"
              onChange={(e) => onChange({ treatment_type: e.target.value || null })}
              className="flex-1 bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-[12px] text-white px-2 py-1 transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="text-[#3A373C] hover:text-[#FF4D4D] transition-colors shrink-0 mt-1"
          aria-label="Remove area"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

type Props = {
  bodyAreas: DraftBodyArea[]
  exerciseBlocks: DraftBlock[]
  details: Partial<Pick<SessionDetailsRow, 'physio_provider' | 'physio_clearance_status' | 'physio_notes'>>
  onBodyAreasChange: (areas: DraftBodyArea[]) => void
  onExerciseBlocksChange: (blocks: DraftBlock[]) => void
  onDetailsChange: (patch: Partial<SessionDetailsRow>) => void
}

export default function PhysioPanel({
  bodyAreas,
  exerciseBlocks,
  details,
  onBodyAreasChange,
  onExerciseBlocksChange,
  onDetailsChange,
}: Props) {
  const updateArea = (i: number, patch: Partial<DraftBodyArea>) =>
    onBodyAreasChange(bodyAreas.map((a, idx) => (idx === i ? { ...a, ...patch } : a)))

  const deleteArea = (i: number) => onBodyAreasChange(bodyAreas.filter((_, idx) => idx !== i))

  const addArea = () => onBodyAreasChange([...bodyAreas, blankArea(bodyAreas.length)])

  return (
    <div className="space-y-6">
      <p
        className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        Physio Session
      </p>

      {/* Provider + clearance */}
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#6B6870] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
            Provider
          </p>
          <div className="flex gap-2">
            {PROVIDERS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onDetailsChange({ physio_provider: details.physio_provider === p ? null : p })}
                className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] border transition-colors capitalize ${
                  details.physio_provider === p
                    ? 'bg-[#C8F04D] border-[#C8F04D] text-[#141115]'
                    : 'border-[#3A373C] text-[#6B6870] hover:border-[#6B6870]'
                }`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#6B6870] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
            Clearance
          </p>
          <div className="flex flex-wrap gap-2">
            {CLEARANCE_STATUSES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onDetailsChange({ physio_clearance_status: details.physio_clearance_status === value ? null : value })}
                className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] border transition-colors ${
                  details.physio_clearance_status === value
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

        <textarea
          value={details.physio_notes ?? ''}
          onChange={(e) => onDetailsChange({ physio_notes: e.target.value || null })}
          placeholder="Physio session notes…"
          rows={2}
          className="w-full bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-white text-[13px] p-3 placeholder-[#3A373C] transition-colors resize-none leading-relaxed"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        />
      </div>

      {/* Body areas */}
      <div className="space-y-3">
        <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#6B6870]" style={{ fontFamily: "'Inter', sans-serif" }}>
          Body Areas
        </p>
        {bodyAreas.map((area, i) => (
          <BodyAreaCard
            key={i}
            area={area}
            onChange={(patch) => updateArea(i, patch)}
            onDelete={() => deleteArea(i)}
          />
        ))}
        <button
          type="button"
          onClick={addArea}
          className="flex items-center gap-2 px-4 py-2 border border-[#3A373C] text-[#6B6870] text-[11px] font-semibold uppercase tracking-[0.15em] hover:border-[#C8F04D] hover:text-[#C8F04D] transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <Plus size={12} /> Add Body Area
        </button>
      </div>

      {/* Rehab exercises (reuse StrengthPanel) */}
      {exerciseBlocks.length > 0 && (
        <StrengthPanel blocks={exerciseBlocks} onChange={onExerciseBlocksChange} />
      )}
      {exerciseBlocks.length === 0 && (
        <button
          type="button"
          onClick={() => onExerciseBlocksChange([{ block_index: 0, block_name: 'Rehab Exercises', block_type: 'main', emom_interval_seconds: null, circuit_rounds: null, intensity_percent: null, notes: null, exercises: [] }])}
          className="flex items-center gap-2 px-4 py-2 border border-[#3A373C] text-[#6B6870] text-[11px] font-semibold uppercase tracking-[0.15em] hover:border-[#C8F04D] hover:text-[#C8F04D] transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <Plus size={12} /> Add Rehab Exercises
        </button>
      )}
    </div>
  )
}
