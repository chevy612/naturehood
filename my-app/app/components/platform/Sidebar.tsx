'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Avatar } from '@/app/components/platform/Avatar'
import { useNotifications } from '@/app/components/platform/notifications/NotificationsProvider'
import { UnreadBadge } from '@/app/components/platform/notifications/UnreadBadge'
import { NAV_GROUPS, activeHrefFor, type NavGroup } from '@/app/components/platform/nav-config'
import { signOut } from '@/app/(platform)/account/actions'

export type SidebarProfile = { name: string; username: string | null; avatarUrl: string | null }

const COLLAPSE_KEY = 'nh_sidebar_collapsed'
const COLLAPSE_EVENT = 'nh_sidebar_collapsed_change'
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

export function Sidebar({ profile }: { profile: SidebarProfile }) {
  const pathname = usePathname()
  const { unreadCount } = useNotifications()
  const activeHref = activeHrefFor(pathname, ALL_HREFS)

  const collapsed = useSyncExternalStore(subscribeCollapse, getCollapseSnapshot, () => EMPTY_COLLAPSE)
  const toggle = (key: string) => toggleCollapse(key)

  return (
    <nav className="fixed left-0 top-0 z-50 hidden h-screen w-60 flex-col border-r border-[#3A373C] bg-[#141115] md:flex">
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
