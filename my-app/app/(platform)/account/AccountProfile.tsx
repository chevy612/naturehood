'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Avatar } from '@/app/components/platform/Avatar'
import { useTeamModeToggle } from '@/app/components/platform/team/TeamModeProvider'
import { PillTag } from '@/app/components/ui/tags'
import DashboardEditForm from './DashboardEditForm'

// ─────────────────────────────────────────────
// ACCOUNT PROFILE HEADER (client — handles edit toggle)
// ─────────────────────────────────────────────

type Props = {
  name: string
  username: string
  bio: string
  role: string | null
  avatarUrl: string | null
  workoutCount: number
}

function roleLabel(role: string | null): string {
  if (role === 'brand') return 'Brand'
  if (role === 'other') return 'Explorer'
  return 'Athlete'
}

function ModeToggle() {
  const { mode, saving, error, toggle } = useTeamModeToggle()
  const label = mode === 'coach' ? 'Coach' : 'Athlete'
  const next = mode === 'coach' ? 'Athlete' : 'Coach'

  return (
    <div className="mb-2">
      <button
        type="button"
        role="switch"
        aria-checked={mode === 'coach'}
        aria-label={`${label} mode. Switch to ${next}.`}
        disabled={saving}
        onClick={toggle}
        data-testid="team-mode-toggle"
        className="inline-flex items-center gap-2 disabled:opacity-60"
      >
        <PillTag label={label} size="sm" variant="ghost-green" />
        <span
          aria-hidden
          className={`relative inline-block h-5 w-9 rounded-full transition-colors ${mode === 'coach' ? 'bg-[#F5F5F5]' : 'bg-[#3A373C]'}`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${mode === 'coach' ? 'left-[18px] bg-[#141115]' : 'left-0.5 bg-[#A09EA3]'}`}
          />
        </span>
      </button>
      {error ? <p className="mt-1 text-[12px] text-[#FF4D4D]" style={{ fontFamily: "'DM Sans', sans-serif" }} role="alert">{error}</p> : null}
    </div>
  )
}

export default function AccountProfile({ name, username, bio, role, avatarUrl, workoutCount }: Props) {
  const [editOpen, setEditOpen] = useState(false)

  return (
    <div>
      {/* ── Profile header ── */}
      <div className="mb-6 flex items-start gap-4 sm:gap-6">
        <Avatar name={name} size="lg" photoUrl={avatarUrl} />

        <div className="min-w-0 flex-1">
          <ModeToggle />
          {/* Name + role */}
          <h1
            className="text-[20px] font-bold text-white leading-tight mb-0.5"
            style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em' }}
          >
            {name}
          </h1>
          {username && (
            <p
              className="text-[13px] text-[#6B6870] mb-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              @{username}
            </p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <PillTag label={roleLabel(role)} size="sm" variant="ghost-green" />
            <span
              className="text-[12px] text-[#6B6870]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {workoutCount} {workoutCount === 1 ? 'workout' : 'workouts'}
            </span>
          </div>
        </div>
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