'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useSyncExternalStore } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Avatar } from '@/app/components/platform/Avatar'
import { useNotifications } from '@/app/components/platform/notifications/NotificationsProvider'
import { UnreadBadge } from '@/app/components/platform/notifications/UnreadBadge'
import { NAV_GROUPS, activeHrefFor, type NavGroup } from '@/app/components/platform/nav-config'
import { signOut } from '@/app/(platform)/account/actions'

export type SidebarProfile = { name: string; username: string | null; avatarUrl: string | null }

const COLLAPSE_KEY = 'nh_sidebar_collapsed'
const COLLAPSE_EVENT = 'nh_sidebar_collapsed_change'
const WIDTH_KEY = 'nh_sidebar_width'
const WIDTH_VAR = '--nh-sidebar-w'
const WIDTH_MIN = 200
const WIDTH_MAX = 420
const WIDTH_DEFAULT = 240
const ALL_HREFS = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href))
const display = { fontFamily: "'Sk Modernist', sans-serif" } as const

type CollapseMap = Record<string, boolean>
const EMPTY_COLLAPSE: CollapseMap = {}

// External store for the per-group collapse state, persisted in localStorage.
// Using useSyncExternalStore (instead of an effect) keeps SSR deterministic and
// avoids cascading-render lint while still reacting to toggles and other tabs.
let cachedRaw: string | null = null
let cachedValue: CollapseMap = EMPTY_COLLAPSE
function getCollapseSnapshot(): CollapseMap {
  const raw = localStorage.getItem(COLLAPSE_KEY)
  if (raw !== cachedRaw) {
    cachedRaw = raw
    try {
      cachedValue = raw ? JSON.parse(raw) : EMPTY_COLLAPSE
    } catch {
      cachedValue = EMPTY_COLLAPSE
    }
  }
  return cachedValue
}
function subscribeCollapse(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(COLLAPSE_EVENT, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(COLLAPSE_EVENT, callback)
  }
}
function toggleCollapse(key: string) {
  const next = { ...getCollapseSnapshot(), [key]: !getCollapseSnapshot()[key] }
  try {
    localStorage.setItem(COLLAPSE_KEY, JSON.stringify(next))
  } catch {}
  window.dispatchEvent(new Event(COLLAPSE_EVENT))
}

const clampWidth = (px: number) => Math.min(WIDTH_MAX, Math.max(WIDTH_MIN, Math.round(px)))
function applyWidth(px: number) {
  document.documentElement.style.setProperty(WIDTH_VAR, `${px}px`)
}

// Drag handle on the sidebar's right edge. Updates the CSS variable live while
// dragging (so both the sidebar and the content offset track it without a React
// re-render) and persists the final width to localStorage. Double-click resets.
function ResizeHandle() {
  // Apply any persisted width on mount; the CSS default (240px) covers SSR.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(WIDTH_KEY)
      if (raw != null) {
        const n = Number(raw)
        if (Number.isFinite(n)) applyWidth(clampWidth(n))
      }
    } catch {}
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const styleW = getComputedStyle(document.documentElement).getPropertyValue(WIDTH_VAR)
    const startW = parseFloat(styleW) || WIDTH_DEFAULT

    const onMove = (ev: PointerEvent) => applyWidth(clampWidth(startW + (ev.clientX - startX)))
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
      const final = clampWidth(startW + (ev.clientX - startX))
      try { localStorage.setItem(WIDTH_KEY, String(final)) } catch {}
    }

    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const reset = () => {
    applyWidth(WIDTH_DEFAULT)
    try { localStorage.setItem(WIDTH_KEY, String(WIDTH_DEFAULT)) } catch {}
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar (double-click to reset)"
      onPointerDown={onPointerDown}
      onDoubleClick={reset}
      className="group absolute right-0 top-0 z-10 h-full w-2 translate-x-1/2 cursor-col-resize"
    >
      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-transparent transition-colors group-hover:bg-[#6B6870]" />
    </div>
  )
}

export function Sidebar({ profile }: { profile: SidebarProfile }) {
  const pathname = usePathname()
  const { unreadCount } = useNotifications()
  const activeHref = activeHrefFor(pathname, ALL_HREFS)

  const collapsed = useSyncExternalStore(subscribeCollapse, getCollapseSnapshot, () => EMPTY_COLLAPSE)
  const toggle = (key: string) => toggleCollapse(key)

  return (
    <nav
      className="fixed left-0 top-0 z-50 hidden h-screen flex-col border-r border-[#3A373C] bg-[#141115] md:flex"
      style={{ width: 'var(--nh-sidebar-w)' }}
    >
      <ResizeHandle />
      {/* Brand */}
      <div className="px-5 pb-6 pt-7">
        <Link href="/home" aria-label="Naturehood home" className="block w-fit">
          <Image src="/naturehood.svg" alt="Naturehood" width={140} height={16} priority className="block h-auto w-[140px]" />
        </Link>
      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto px-3">
        {NAV_GROUPS.map((group) => (
          <Group
            key={group.key}
            group={group}
            collapsed={!!collapsed[group.key]}
            onToggle={() => toggle(group.key)}
            activeHref={activeHref}
            unreadCount={unreadCount}
          />
        ))}
      </div>

      {/* Pinned account block */}
      <div className="border-t border-[#3A373C] p-3">
        <Link
          href="/account"
          className={`flex items-center gap-3 rounded-lg px-2 py-2 transition-colors ${
            activeHrefFor(pathname, ['/account']) ? 'bg-[#1E1B1F]' : 'hover:bg-[#1A1719]'
          }`}
        >
          <Avatar name={profile.name} size="sm" photoUrl={profile.avatarUrl} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-bold text-[#F5F5F5]" style={display}>
              {profile.name}
            </span>
            {profile.username ? (
              <span className="block truncate text-[11px] font-bold text-[#6B6870]" style={display}>
                @{profile.username}
              </span>
            ) : null}
          </span>
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="mt-1 w-full px-2 py-1.5 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#6B6870] transition-colors hover:text-[#F5F5F5]"
            style={display}
          >
            Sign out
          </button>
        </form>
      </div>
    </nav>
  )
}

function Group({
  group,
  collapsed,
  onToggle,
  activeHref,
  unreadCount,
}: {
  group: NavGroup
  collapsed: boolean
  onToggle: () => void
  activeHref: string | undefined
  unreadCount: number
}) {
  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-1 px-2 py-1.5 text-[13px] font-bold text-[#6B6870] transition-colors hover:text-[#A09EA3]"
        style={display}
        aria-expanded={!collapsed}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        {group.label}
      </button>

      {!collapsed && (
        <div className="mt-1 flex flex-col gap-0.5">
          {group.items.map(({ label, href, Icon, badge }) => {
            const active = href === activeHref
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-bold transition-colors ${
                  active
                    ? 'bg-[#1E1B1F] text-[#F5F5F5]'
                    : 'text-[#6B6870] hover:bg-[#1A1719] hover:text-[#A09EA3]'
                }`}
                style={display}
              >
                {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-[#F5F5F5]" />}
                <span className="relative flex">
                  <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                  {badge ? <UnreadBadge count={unreadCount} /> : null}
                </span>
                {label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
