'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Avatar } from '@/app/components/platform/Avatar'
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

export default function AccountProfile({ name, username, bio, role, avatarUrl, workoutCount }: Props) {
  const [editOpen, setEditOpen] = useState(false)

  return (
    <div>
      {/* ── Profile header ── */}
      <div className="flex items-start gap-6 mb-6">
        <Avatar name={name} size="lg" photoUrl={avatarUrl} />

        <div className="flex-1 min-w-0">
          {/* Name + role */}
          <h1
            className="text-[20px] font-bold text-white leading-tight mb-0.5"
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}
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
          className="flex-1 py-2.5 border border-[#3A373C] text-white text-[12px] font-semibold uppercase tracking-[0.1em] hover:border-[#C8F04D]/40 hover:text-[#C8F04D] transition-colors"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {editOpen ? 'Close' : 'Edit Profile'}
        </button>
        {username ? (
          <Link
            href={`/${username}`}
            className="flex-1 py-2.5 border border-[#3A373C] text-center text-white text-[12px] font-semibold uppercase tracking-[0.1em] hover:border-[#C8F04D]/40 hover:text-[#C8F04D] transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            View Profile
          </Link>
        ) : (
          <button
            disabled
            className="flex-1 py-2.5 border border-[#3A373C] text-[#6B6870] text-[12px] font-semibold uppercase tracking-[0.1em] opacity-40 cursor-not-allowed"
            style={{ fontFamily: "'Inter', sans-serif" }}
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