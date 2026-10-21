'use client'

import type { ReactNode } from 'react'
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

export const toNum = (v: string) => (v === '' || isNaN(Number(v)) ? null : Number(v))
