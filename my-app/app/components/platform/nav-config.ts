import type { LucideIcon } from 'lucide-react'
import { Home, Bell, Calendar, Dumbbell, Utensils, Users, Share2, User, LayoutDashboard, MessageCircle } from 'lucide-react'
import type { TeamMode } from '@/lib/team/mode'

/** Nav label keys map to `Nav.*` messages. */
export type NavLabelKey =
  | 'feed'
  | 'notifications'
  | 'events'
  | 'dashboard'
  | 'workouts'
  | 'meals'
  | 'message'
  | 'sharing'
  | 'tracking'
  | 'community'
  | 'personal'
  | 'team'
  | 'alerts'
  | 'account'

export type NavItem = { labelKey: NavLabelKey; href: string; Icon: LucideIcon; badge?: boolean }
export type NavGroup = { key: 'community' | 'personal' | 'team'; labelKey: NavLabelKey; items: NavItem[] }
export type MobileTab = NavItem & { match: string[] }

const TEAM_ITEMS: Record<TeamMode, NavItem[]> = {
  athlete: [
    { labelKey: 'message', href: '/my-team/message', Icon: MessageCircle },
    { labelKey: 'sharing', href: '/my-team/sharing', Icon: Share2 },
  ],
  coach: [
    { labelKey: 'message', href: '/my-team/message', Icon: MessageCircle },
    { labelKey: 'tracking', href: '/my-team/tracking', Icon: Users },
  ],
}

export function navGroupsFor(mode: TeamMode): NavGroup[] {
  return [
    ...BASE_GROUPS,
    { key: 'team', labelKey: 'team', items: TEAM_ITEMS[mode] },
  ]
}

const BASE_GROUPS: NavGroup[] = [
  {
    key: 'community',
    labelKey: 'community',
    items: [
      { labelKey: 'feed', href: '/home', Icon: Home },
      { labelKey: 'notifications', href: '/home/notifications', Icon: Bell, badge: true },
      { labelKey: 'events', href: '/events', Icon: Calendar },
    ],
  },
  {
    key: 'personal',
    labelKey: 'personal',
    items: [
      { labelKey: 'dashboard', href: '/personal/dashboard', Icon: LayoutDashboard },
      { labelKey: 'workouts', href: '/record', Icon: Dumbbell },
      { labelKey: 'meals', href: '/meals', Icon: Utensils },
    ],
  },
]

export const MOBILE_TABS: MobileTab[] = [
  { labelKey: 'community', href: '/home', Icon: Home, match: ['/home', '/events'] },
  { labelKey: 'personal', href: '/personal/dashboard', Icon: Utensils, match: ['/personal', '/meals', '/record'] },
  { labelKey: 'team', href: '/my-team', Icon: Users, match: ['/my-team'] },
  { labelKey: 'alerts', href: '/home/notifications', Icon: Bell, badge: true, match: ['/home/notifications'] },
  { labelKey: 'account', href: '/account', Icon: User, match: ['/account'] },
]

export function activeHrefFor(pathname: string, hrefs: string[]): string | undefined {
  return hrefs
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0]
}

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
