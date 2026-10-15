'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, Calendar, Bell, User } from 'lucide-react'
import { useNotifications } from '@/app/components/platform/notifications/NotificationsProvider'
import { UnreadBadge } from '@/app/components/platform/notifications/UnreadBadge'

const TABS = [
  { label: 'Home',    href: '/home',               Icon: Home,     badge: false },
  { label: 'Record',  href: '/record',             Icon: Plus,     badge: false },
  { label: 'Events',  href: '/events',             Icon: Calendar, badge: false },
  { label: 'Alerts',  href: '/home/notifications', Icon: Bell,     badge: true  },
  { label: 'Account', href: '/account',            Icon: User,     badge: false },
]

export function BottomNav() {
  const pathname = usePathname()
  const { unreadCount } = useNotifications()
  // The most specific tab wins so /home/notifications does not also light up Home.
  const activeHref = TABS
    .filter(({ href }) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href

  return (
    <>
      {/* ── Mobile: fixed bottom bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-stretch border-t border-[#3A373C] bg-[#141115] md:hidden">
        {TABS.map(({ label, href, Icon, badge }) => {
          const active = href === activeHref
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors duration-150 ${
                active ? 'text-[#F5F5F5]' : 'text-[#6B6870] hover:text-[#A09EA3]'
              }`}
            >
              {active && (
                <span className="absolute top-0 left-0 right-0 h-[2px] bg-[#F5F5F5]" />
              )}
              <span className="relative">
                <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                {badge ? <UnreadBadge count={unreadCount} /> : null}
              </span>
              <span
                className="text-[9px] font-semibold uppercase tracking-[0.15em]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* ── Desktop: fixed left sidebar ── */}
      <nav className="fixed left-0 top-0 z-50 hidden h-screen w-16 flex-col border-r border-[#3A373C] bg-[#141115] pt-8 gap-1 md:flex">
        {TABS.map(({ label, href, Icon, badge }) => {
          const active = href === activeHref
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center justify-center gap-1.5 py-3 transition-colors duration-150 ${
                active
                  ? 'text-[#F5F5F5] bg-[#1E1B1F]'
                  : 'text-[#6B6870] hover:text-[#A09EA3] hover:bg-[#1A1719]'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#F5F5F5]" />
              )}
              <span className="relative">
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {badge ? <UnreadBadge count={unreadCount} /> : null}
              </span>
              <span
                className="text-[8px] font-semibold uppercase tracking-[0.12em]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
