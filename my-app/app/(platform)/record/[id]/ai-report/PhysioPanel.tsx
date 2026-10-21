'use client'

import { Plus, X, MoveHorizontal, UserRound, ShieldCheck } from 'lucide-react'
import type { PhysioBodyAreaRow, SessionDetailsRow } from '@/lib/types'
import { Button, ButtonPropertySelect } from '@/app/components/ui/buttons'
import { InputInline, TextAreaInline } from '@/app/components/ui/inputs'
import StrengthPanel, { type DraftBlock } from './StrengthPanel'
import { ReportSection, ReportCard, PropertyRow } from './ReportSection'

export type DraftBodyArea = Omit<PhysioBodyAreaRow, 'id' | 'training_log_id' | 'user_id'>

const SIDES = [
  { value: 'left',      label: 'Left' },
  { value: 'right',     label: 'Right' },
  { value: 'bilateral', label: 'Bilateral' },
] as const
const PROVIDERS = [
  { value: 'physiotherapist', label: 'Physiotherapist' },
  { value: 'coach',           label: 'Coach' },
  { value: 'self',            label: 'Self' },
] as const
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
  const pain = (v: string) => (v === '' || isNaN(Number(v)) ? null : Math.min(10, Math.max(0, Number(v))))

  return (
    <ReportCard>
      <div className="flex items-center gap-2 border-b border-[#2A272C] px-2 py-2">
        <InputInline
          value={area.area}
          onValueChange={(v) => onChange({ area: v })}
          placeholder="Body area (e.g. left hamstring)"
          className="flex-1 text-[14px] font-semibold"
        />
        <ButtonPropertySelect
          label="Side"
          options={SIDES}
          value={area.side}
          onChange={(v) => onChange({ side: v })}
          icon={<MoveHorizontal />}
          allowClear
          align="right"
        />
        <Button variant="ghost" size="icon-sm" onClick={onDelete} ariaLabel="Remove area">
          <X size={14} />
        </Button>
      </div>

      <div className="px-3 py-1.5">
        <PropertyRow label="Pain">
          <div className="flex items-center gap-1 text-[12px] text-[#6B6870]">
            <span className="w-14">
              <InputInline type="number" min={0} max={10} value={area.pain_score_before} placeholder="—" ariaLabel="Pain before"
                onValueChange={(v) => onChange({ pain_score_before: pain(v) })} />
            </span>
            <span>→</span>
            <span className="w-14">
              <InputInline type="number" min={0} max={10} value={area.pain_score_after} placeholder="—" ariaLabel="Pain after"
                onValueChange={(v) => onChange({ pain_score_after: pain(v) })} />
            </span>
            <span>/ 10 · before → after</span>
          </div>
        </PropertyRow>
        <PropertyRow label="Injury">
          <InputInline value={area.injury_name} placeholder="e.g. hamstring strain"
            onValueChange={(v) => onChange({ injury_name: v || null })} />
        </PropertyRow>
        <PropertyRow label="Treatment">
          <InputInline value={area.treatment_type} placeholder="e.g. dry needling, massage"
            onValueChange={(v) => onChange({ treatment_type: v || null })} />
        </PropertyRow>
      </div>
    </ReportCard>
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
    <div className="space-y-10">
      <ReportSection
        title="Physio"
        action={
          <div className="flex items-center gap-1.5">
            <ButtonPropertySelect
              label="Provider"
              options={PROVIDERS}
              value={details.physio_provider}
              onChange={(v) => onDetailsChange({ physio_provider: v })}
              icon={<UserRound />}
              allowClear
              align="right"
            />
            <ButtonPropertySelect
              label="Clearance"
              options={CLEARANCE_STATUSES}
              value={details.physio_clearance_status}
              onChange={(v) => onDetailsChange({ physio_clearance_status: v })}
              icon={<ShieldCheck />}
              allowClear
              align="right"
            />
          </div>
        }
      >
        <TextAreaInline
          value={details.physio_notes}
          onValueChange={(v) => onDetailsChange({ physio_notes: v || null })}
          placeholder="Add physio notes…"
          ariaLabel="Physio notes"
          className="-mx-2 w-[calc(100%+1rem)]"
        />
      </ReportSection>

      <ReportSection
        title="Body areas"
        count={bodyAreas.length}
        action={
          <Button variant="ghost" size="sm" onClick={addArea}>
            <Plus size={14} /> Add area
          </Button>
        }
      >
        <div className="space-y-3">
          {bodyAreas.map((area, i) => (
            <BodyAreaCard
              key={i}
              area={area}
              onChange={(patch) => updateArea(i, patch)}
              onDelete={() => deleteArea(i)}
            />
          ))}
        </div>
      </ReportSection>

      {/* Rehab exercises (reuse StrengthPanel) */}
      {exerciseBlocks.length > 0 ? (
        <StrengthPanel title="Rehab exercises" blocks={exerciseBlocks} onChange={onExerciseBlocksChange} />
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onExerciseBlocksChange([{ block_index: 0, block_name: 'Rehab Exercises', block_type: 'main', emom_interval_seconds: null, circuit_rounds: null, intensity_percent: null, notes: null, exercises: [] }])}
        >
          <Plus size={14} /> Add rehab exercises
        </Button>
      )}
    </div>
  )
}
