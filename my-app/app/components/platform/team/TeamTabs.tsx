'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTeamMode } from '@/app/components/platform/team/TeamModeProvider'
import { sans } from '@/lib/social/format'
import type { TeamMode } from '@/lib/team/mode'

const TABS: Record<TeamMode, { label: string; href: string; hint: string }[]> = {
  athlete: [
    { label: 'Message', href: '/my-team/message', hint: 'Comments and likes on your logs' },
    { label: 'Sharing', href: '/my-team/sharing', hint: 'Coaches who can see my logs' },
  ],
  coach: [
    { label: 'Message', href: '/my-team/message', hint: 'Notifications, then invitations' },
    { label: 'Tracking', href: '/my-team/tracking', hint: 'Athletes I follow as a Coach' },
  ],
}

export function TeamTabs() {
  const pathname = usePathname()
  const { mode } = useTeamMode()
  const tabs = TABS[mode]
  const active = tabs.find((tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`)) ?? tabs[0]

  return (
    <div className="mb-6">
      <div className="flex rounded-full bg-[#1E1B1F] p-1" role="tablist" aria-label="Team sections">
        {tabs.map((tab) => {
          const isActive = tab.href === active.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              role="tab"
              aria-selected={isActive}
              className={`flex-1 rounded-full py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                isActive ? 'bg-[#F5F5F5] text-[#141115]' : 'text-[#6B6870] hover:text-white'
              }`}
              style={sans}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
      <p className="mt-3 text-center text-[12px] text-[#6B6870]" style={sans}>{active.hint}</p>
    </div>
  )
}
