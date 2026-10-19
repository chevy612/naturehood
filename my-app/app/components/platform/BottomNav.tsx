'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useNotifications } from '@/app/components/platform/notifications/NotificationsProvider'
import { UnreadBadge } from '@/app/components/platform/notifications/UnreadBadge'
import { MOBILE_TABS, activeMobileHref } from '@/app/components/platform/nav-config'

export function BottomNav() {
  const pathname = usePathname()
  const { unreadCount } = useNotifications()
  const activeHref = activeMobileHref(pathname)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-stretch border-t border-[#3A373C] bg-[#141115] md:hidden">
      {MOBILE_TABS.map(({ label, href, Icon, badge }) => {
        const active = href === activeHref
        return (
          <Link
            key={href}
            href={href}
            className={`relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors duration-150 ${
              active ? 'text-[#F5F5F5]' : 'text-[#6B6870] hover:text-[#A09EA3]'
            }`}
          >
            {active && <span className="absolute top-0 left-0 right-0 h-[2px] bg-[#F5F5F5]" />}
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
  )
}
