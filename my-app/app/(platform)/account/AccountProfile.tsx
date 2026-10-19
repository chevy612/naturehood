'use client'

import { useState } from 'react'
import { Avatar } from '@/app/components/platform/Avatar'
import { PillTag } from '@/app/components/ui/tags'
import DashboardEditForm from './DashboardEditForm'

// ─────────────────────────────────────────────
// ACCOUNT PROFILE HEADER (client — handles edit toggle + share)
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

const buttonClass =
  'flex-1 rounded-full border border-[#3A373C] py-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:border-[#F5F5F5]/40 hover:text-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40'

export default function AccountProfile({ name, username, bio, role, avatarUrl, workoutCount }: Props) {
  const [editOpen, setEditOpen] = useState(false)
  const [shareLabel, setShareLabel] = useState('Share Profile')

  async function handleShare() {
    if (!username) return
    const url = `${window.location.origin}/${username}`
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url })
      } catch {
        // user cancelled — no-op
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareLabel('Link copied!')
      setTimeout(() => setShareLabel('Share Profile'), 2000)
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <div>
      {/* ── Profile header ── */}
      <div className="mb-5 flex items-start gap-5">
        <Avatar name={name} size="lg" photoUrl={avatarUrl} />

        <div className="min-w-0 flex-1 pt-1">
          <h1
            className="text-[22px] font-bold leading-tight text-white"
            style={{ fontFamily: "'Sk Modernist', sans-serif", letterSpacing: '-0.02em' }}
          >
            {name}
          </h1>
          {username && (
            <p className="mt-0.5 text-[13px] text-[#6B6870]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              @{username}
            </p>
          )}
          {bio && (
            <p className="mt-2 whitespace-pre-wrap text-[14px] leading-6 text-[#A09EA3]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {bio}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <PillTag label={roleLabel(role)} size="sm" variant="ghost-green" />
            <span className="text-[12px] text-[#6B6870]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {workoutCount} {workoutCount === 1 ? 'workout' : 'workouts'}
            </span>
          </div>
        </div>
      </div>

      {/* ── CTA buttons ── */}
      <div className="mb-8 flex gap-3">
        <button
          onClick={() => setEditOpen((v) => !v)}
          className={buttonClass}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {editOpen ? 'Close' : 'Edit Profile'}
        </button>
        <button
          onClick={handleShare}
          disabled={!username}
          className={buttonClass}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
          title={username ? 'Share your profile link' : 'Set a username to share your profile'}
        >
          {shareLabel}
        </button>
      </div>

      {/* ── Edit form (toggleable) ── */}
      {editOpen && (
        <div className="mb-8 rounded-2xl border border-[#3A373C] bg-[#1A1719] p-5">
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
