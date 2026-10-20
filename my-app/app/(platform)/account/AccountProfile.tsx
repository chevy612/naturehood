'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeftRight } from 'lucide-react'
import { Avatar } from '@/app/components/platform/Avatar'
import { useTeamModeToggle } from '@/app/components/platform/team/TeamModeProvider'
import { PillTag } from '@/app/components/ui/tags'
import { teamModeLabel } from '@/lib/team/mode'
import DashboardEditForm from './DashboardEditForm'

// ─────────────────────────────────────────────
// ACCOUNT PROFILE HEADER (client — handles edit toggle)
// ─────────────────────────────────────────────

type Props = {
  name: string
  username: string
  bio: string
  avatarUrl: string | null
  workoutCount: number
}

function ModeToggle() {
  const { mode, saving, error, toggle } = useTeamModeToggle()
  const label = teamModeLabel(mode)
  const next = teamModeLabel(mode === 'coach' ? 'athlete' : 'coach')

  return (
    <div className="flex shrink-0 flex-col items-end self-start pt-1">
      <button
        type="button"
        aria-label={`${label} mode. Switch to ${next}.`}
        disabled={saving}
        onClick={toggle}
        data-testid="team-mode-toggle"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#3A373C] text-[#F5F5F5] transition-colors hover:border-[#F5F5F5]/50 hover:bg-[#1E1B1F] disabled:opacity-60"
      >
        <ArrowLeftRight size={18} strokeWidth={2} aria-hidden />
      </button>
      {error ? (
        <p
          className="mt-1 max-w-[8rem] text-right text-[11px] text-[#FF4D4D]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default function AccountProfile({ name, username, bio, avatarUrl, workoutCount }: Props) {
  const [editOpen, setEditOpen] = useState(false)
  const { mode } = useTeamModeToggle()

  return (
    <div>
      {/* ── Profile header ── */}
      <div className="mb-6 flex items-start gap-4 sm:gap-6">
        <Avatar name={name} size="lg" photoUrl={avatarUrl} />

        <div className="min-w-0 flex-1">
          <h1
            className="text-[20px] font-bold text-white leading-tight mb-0.5"
            style={{ fontFamily: "'Sk Modernist', sans-serif", letterSpacing: '-0.02em' }}
          >
            {name}
          </h1>
          {username ? (
            <p
              className="text-[13px] text-[#6B6870] mb-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              @{username}
            </p>
          ) : null}
          <div className="flex items-center gap-3 flex-wrap">
            <PillTag label={teamModeLabel(mode)} size="sm" variant="ghost-green" />
            <span
              className="text-[12px] text-[#6B6870]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {workoutCount} {workoutCount === 1 ? 'workout' : 'workouts'}
            </span>
          </div>
        </div>

        <ModeToggle />
      </div>

      {/* ── CTA buttons ── */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setEditOpen((v) => !v)}
          className="flex-1 py-2.5 border border-[#3A373C] text-white text-[12px] font-semibold uppercase tracking-[0.1em] hover:border-[#F5F5F5]/40 hover:text-[#F5F5F5] transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {editOpen ? 'Close' : 'Edit Profile'}
        </button>
        {username ? (
          <Link
            href={`/${username}`}
            className="flex-1 py-2.5 border border-[#3A373C] text-center text-white text-[12px] font-semibold uppercase tracking-[0.1em] hover:border-[#F5F5F5]/40 hover:text-[#F5F5F5] transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            View Profile
          </Link>
        ) : (
          <button
            disabled
            className="flex-1 py-2.5 border border-[#3A373C] text-[#6B6870] text-[12px] font-semibold uppercase tracking-[0.1em] opacity-40 cursor-not-allowed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            title="Set a username to share your profile"
          >
            View Profile
          </button>
        )}
      </div>

      {/* ── Edit form (toggleable) ── */}
      {editOpen && (
        <div className="border border-[#3A373C] bg-[#1A1719] p-5 mb-8">
          <DashboardEditForm
            initialName={name}
            initialUsername={username}
            initialBio={bio}
            initialAvatarUrl={avatarUrl}
          />
        </div>
      )}
    </div>
  )
}
