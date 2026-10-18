'use client'

import { useRef } from 'react'
import { sans } from '@/lib/social/format'

export type SwipeTab<T extends string> = {
  id: T
  label: string
  icon?: React.ReactNode
}

const SWIPE_MIN_DISTANCE = 56
const SWIPE_DIRECTION_RATIO = 1.5
const IGNORED_TARGETS = 'input, textarea, select, video, [data-no-swipe]'

export function TabBar<T extends string>({
  tabs,
  active,
  onChange,
  label,
}: {
  tabs: SwipeTab<T>[]
  active: T
  onChange: (id: T) => void
  label: string
}) {
  return (
    <div className="mb-5 flex rounded-full bg-[#1E1B1F] p-1" role="tablist" aria-label={label}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`tab-${tab.id}`}
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${
            active === tab.id ? 'bg-[#F5F5F5] text-[#141115]' : 'text-[#6B6870] hover:text-white'
          }`}
          style={sans}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  )
}

/** Wraps a tab panel and switches to the neighbouring tab on a horizontal touch swipe. */
export function SwipePanel<T extends string>({
  tabs,
  active,
  onChange,
  children,
}: {
  tabs: SwipeTab<T>[]
  active: T
  onChange: (id: T) => void
  children: React.ReactNode
}) {
  const start = useRef<{ x: number; y: number } | null>(null)

  function handleTouchStart(event: React.TouchEvent) {
    const target = event.target as HTMLElement
    if (event.touches.length !== 1 || target.closest(IGNORED_TARGETS)) {
      start.current = null
      return
    }
    start.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }
  }

  function handleTouchEnd(event: React.TouchEvent) {
    const origin = start.current
    start.current = null
    if (!origin) return
    const touch = event.changedTouches[0]
    const dx = touch.clientX - origin.x
    const dy = touch.clientY - origin.y
    if (Math.abs(dx) < SWIPE_MIN_DISTANCE || Math.abs(dx) < Math.abs(dy) * SWIPE_DIRECTION_RATIO) return
    const index = tabs.findIndex((tab) => tab.id === active)
    const next = tabs[index + (dx < 0 ? 1 : -1)]
    if (next) onChange(next.id)
  }

  return (
    <div
      role="tabpanel"
      aria-labelledby={`tab-${active}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => { start.current = null }}
      className="touch-pan-y"
      data-testid="swipe-panel"
    >
      {children}
    </div>
  )
}
