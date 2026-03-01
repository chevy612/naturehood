'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, Calendar, User } from 'lucide-react'

const TABS = [
  { label: 'Home',    href: '/home',    Icon: Home     },
  { label: 'Record',  href: '/record',  Icon: Plus     },
  { label: 'Events',  href: '/events',  Icon: Calendar },
  { label: 'Account', href: '/account', Icon: User     },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <>
      {/* ── Mobile: fixed bottom bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch border-t border-[#3A373C] bg-[#141115] md:hidden">
        {TABS.map(({ label, href, Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors duration-150 ${
                active ? 'text-[#C8F04D]' : 'text-[#6B6870] hover:text-[#A09EA3]'
              }`}
            >
              {active && (
                <span className="absolute top-0 left-0 right-0 h-[2px] bg-[#C8F04D]" />
              )}
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
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
      <nav className="fixed left-0 top-0 z-50 hidden h-screen w-20 flex-col border-r border-[#3A373C] bg-[#141115] pt-8 gap-1 md:flex">
        {TABS.map(({ label, href, Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center justify-center gap-1.5 py-4 transition-colors duration-150 ${
                active
                  ? 'text-[#C8F04D] bg-[#1E1B1F]'
                  : 'text-[#6B6870] hover:text-[#A09EA3] hover:bg-[#1A1719]'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#C8F04D]" />
              )}
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
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
