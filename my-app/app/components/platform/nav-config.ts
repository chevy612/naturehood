import type { LucideIcon } from 'lucide-react'
import { Home, Bell, Calendar, Dumbbell, Utensils, Users, Share2, User, LayoutDashboard, MessageCircle } from 'lucide-react'
import type { TeamMode } from '@/lib/team/mode'

export type NavItem = { label: string; href: string; Icon: LucideIcon; badge?: boolean }
export type NavGroup = { key: 'community' | 'personal' | 'team'; label: string; items: NavItem[] }
// A mobile master-tab owns several route prefixes (e.g. Personal → /meals + /record).
export type MobileTab = NavItem & { match: string[] }

// Team destinations depend on the athlete/coach mode, matching TeamTabs.
const TEAM_ITEMS: Record<TeamMode, NavItem[]> = {
  athlete: [
    { label: 'Message', href: '/my-team/message', Icon: MessageCircle },
    { label: 'Sharing', href: '/my-team/sharing', Icon: Share2 },
  ],
  coach: [
    { label: 'Message', href: '/my-team/message', Icon: MessageCircle },
    { label: 'Tracking', href: '/my-team/tracking', Icon: Users },
  ],
}

// Master tabs → grouped destinations for the desktop sidebar.
export function navGroupsFor(mode: TeamMode): NavGroup[] {
  return [
    ...BASE_GROUPS,
    { key: 'team', label: 'Team', items: TEAM_ITEMS[mode] },
  ]
}

const BASE_GROUPS: NavGroup[] = [
  {
    key: 'community',
    label: 'Community',
    items: [
      { label: 'Feed', href: '/home', Icon: Home },
      { label: 'Notifications', href: '/home/notifications', Icon: Bell, badge: true },
      { label: 'Events', href: '/events', Icon: Calendar },
    ],
  },
  {
    key: 'personal',
    label: 'Personal',
    items: [
      { label: 'Dashboard', href: '/personal/dashboard', Icon: LayoutDashboard },
      { label: 'Workouts', href: '/record', Icon: Dumbbell },
      { label: 'Meals', href: '/meals', Icon: Utensils },
    ],
  },
]

// Compact master-tab destinations for the mobile bottom bar. `match` lists every
// route prefix the tab owns, so e.g. Personal stays active on both /meals and /record.
export const MOBILE_TABS: MobileTab[] = [
  { label: 'Community', href: '/home', Icon: Home, match: ['/home', '/events'] },
  { label: 'Personal', href: '/personal/dashboard', Icon: Utensils, match: ['/personal', '/meals', '/record'] },
  { label: 'Team', href: '/my-team', Icon: Users, match: ['/my-team'] },
  { label: 'Alerts', href: '/home/notifications', Icon: Bell, badge: true, match: ['/home/notifications'] },
  { label: 'Account', href: '/account', Icon: User, match: ['/account'] },
]

/**
 * Returns the href of the most specific nav destination that matches the current
 * path. Longest match wins so `/home/notifications` does not also light up `/home`.
 */
export function activeHrefFor(pathname: string, hrefs: string[]): string | undefined {
  return hrefs
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0]
}

/**
 * Picks the active mobile tab by the longest matching route prefix across all tabs,
 * so Notifications (/home/notifications) wins over Community (/home) on that route.
 */
export function activeMobileHref(pathname: string): string | undefined {
  let best: { href: string; len: number } | undefined
  for (const tab of MOBILE_TABS) {
    for (const prefix of tab.match) {
      if ((pathname === prefix || pathname.startsWith(`${prefix}/`)) && (!best || prefix.length > best.len)) {
        best = { href: tab.href, len: prefix.length }
      }
    }
  }
  return best?.href
}
