'use client'

import type { ReactNode } from 'react'
import {
  Dumbbell, Zap, HeartPulse, Trophy, Stethoscope, Bandage, Waves, Shuffle,
  SignalLow, SignalMedium, SignalHigh, Signal,
  Laugh, Smile, BatteryLow, Frown,
} from 'lucide-react'
import type { SessionType, PerceivedIntensity } from '@/lib/types'
import { SectionHeader } from '@/app/components/ui/typography'
import { cn } from '@/lib/utils'

// Shared layout pieces for the AI report panels (Linear-style: quiet section
// headers with a count + action on the right, hairline cards, dense tables).

export function ReportSection({
  title,
  count,
  action,
  children,
}: {
  title: string
  count?: number
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="flex h-8 items-center justify-between border-b border-[#2A272C]">
        <div className="flex items-baseline gap-2">
          <SectionHeader content={title} className="mb-0 text-[#A09EA3]" />
          {count != null && (
            <span className="text-[12px] tabular-nums text-[#6B6870]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {count}
            </span>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function ReportCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-lg border border-[#2A272C] bg-[#1A1719]', className)}>
      {children}
    </div>
  )
}

// Table column header — Sk Modernist label at spec size (11px), readable contrast
export function ColumnLabel({ children, className }: { children?: ReactNode; className?: string }) {
  return <span className={cn('nh-label px-2 text-[#6B6870]', className)}>{children}</span>
}

// Property list row — muted label on the left, inline field on the right
export function PropertyRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-9 items-center gap-3">
      <span className="w-28 shrink-0 text-[13px] text-[#847E89]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

// Read-only property label — same look as ButtonPropertySelect's chip, for view pages
export function PropertyLabel({ icon, title, children }: { icon?: ReactNode; title?: string; children: ReactNode }) {
  return (
    <span
      title={title}
      className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[#3D3940] px-2 text-[12px] font-medium text-[#E8E8E8] [&_svg]:size-3.5 [&_svg]:shrink-0"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {icon && <span className="text-[#A09EA3]">{icon}</span>}
      {children}
    </span>
  )
}

export const toNum = (v: string) => (v === '' || isNaN(Number(v)) ? null : Number(v))

// ── Session property options (label + icon), shared by the detail view and the AI report editor ──

export const SESSION_TYPES: { value: SessionType; label: string; icon: ReactNode }[] = [
  { value: 'strength',     label: 'Strength',     icon: <Dumbbell /> },
  { value: 'sprint',       label: 'Sprint',       icon: <Zap /> },
  { value: 'conditioning', label: 'Conditioning', icon: <HeartPulse /> },
  { value: 'competition',  label: 'Competition',  icon: <Trophy /> },
  { value: 'physio',       label: 'Physio',       icon: <Stethoscope /> },
  { value: 'rehab',        label: 'Rehab',        icon: <Bandage /> },
  { value: 'recovery',     label: 'Recovery',     icon: <Waves /> },
  { value: 'mixed',        label: 'Mixed',        icon: <Shuffle /> },
]

export const INTENSITIES: { value: PerceivedIntensity; label: string; icon: ReactNode }[] = [
  { value: 'low',      label: 'Low',      icon: <SignalLow /> },
  { value: 'moderate', label: 'Moderate', icon: <SignalMedium /> },
  { value: 'high',     label: 'High',     icon: <SignalHigh /> },
  { value: 'max',      label: 'Max',      icon: <Signal /> },
]

export const READINESS_FEELS = [
  { value: 'great', label: 'Great', icon: <Laugh /> },
  { value: 'good',  label: 'Good',  icon: <Smile /> },
  { value: 'tired', label: 'Tired', icon: <BatteryLow /> },
  { value: 'sore',  label: 'Sore',  icon: <Frown /> },
] as const

