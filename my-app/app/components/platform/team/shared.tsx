'use client'

import { LogoSpinner } from '@/app/components/ui/logo-spinner'
import { PillTag } from '@/app/components/ui/tags'
import { sans } from '@/lib/social/format'
import type { ShareScope, ShareStatus } from '@/lib/team/types'

export function TeamLoading() {
  return (
    <div className="flex justify-center py-16">
      <LogoSpinner size={56} />
    </div>
  )
}

export function StatusBadge({ status }: { status: ShareStatus }) {
  if (status === 'pending') return <PillTag label="Pending" variant="ghost-dark" size="sm" />
  if (status === 'accepted') return <PillTag label="Accepted" variant="ghost-green" size="sm" />
  return <PillTag label="Ended" variant="ghost-dark" size="sm" />
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-normal uppercase tracking-[0.04em] text-[#6B6870]" style={{ fontFamily: "'Sk Modernist', sans-serif" }}>
      {children}
    </p>
  )
}

export function ScopePills({ scope }: { scope: ShareScope }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {scope.shareMeals ? <PillTag label="Meal logs" variant="ghost-green" size="sm" /> : null}
      {scope.shareWorkouts ? <PillTag label="Workout logs" variant="ghost-green" size="sm" /> : null}
    </div>
  )
}

function Switch({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string
  checked: boolean
  disabled?: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span
        className={`relative inline-block h-5 w-9 rounded-full transition-colors ${checked ? 'bg-[#F5F5F5]' : 'bg-[#3A373C]'}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${checked ? 'left-[18px] bg-[#141115]' : 'left-0.5 bg-[#A09EA3]'}`}
        />
      </span>
      <span className="text-[13px] text-white" style={sans}>{label}</span>
    </button>
  )
}

export function ScopeSwitches({
  scope,
  busy,
  onChange,
}: {
  scope: ShareScope
  busy?: boolean
  onChange: (next: ShareScope) => void
}) {
  const onlyMeals = scope.shareMeals && !scope.shareWorkouts
  const onlyWorkouts = scope.shareWorkouts && !scope.shareMeals
  return (
    <div>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <Switch
          label="Meal logs"
          checked={scope.shareMeals}
          disabled={busy || onlyMeals}
          onChange={(next) => onChange({ ...scope, shareMeals: next })}
        />
        <Switch
          label="Workout logs"
          checked={scope.shareWorkouts}
          disabled={busy || onlyWorkouts}
          onChange={(next) => onChange({ ...scope, shareWorkouts: next })}
        />
      </div>
      {onlyMeals || onlyWorkouts ? (
        <p className="mt-2 text-[11px] text-[#6B6870]" style={sans}>
          At least one stays on. To turn both off, use Stop sharing.
        </p>
      ) : null}
    </div>
  )
}

export function EmptyCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#3A373C] px-6 py-10 text-center">
      <p className="text-[14px] font-semibold text-white" style={sans}>{title}</p>
      <p className="mt-1 text-[13px] text-[#6B6870]" style={sans}>{body}</p>
    </div>
  )
}
