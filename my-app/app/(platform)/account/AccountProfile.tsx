'use client'

import { useCallback, useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { Avatar } from '@/app/components/platform/Avatar'
import { useTeamModeToggle } from '@/app/components/platform/team/TeamModeProvider'
import { PillTag } from '@/app/components/ui/tags'
import { teamModeLabel } from '@/lib/team/mode'
import EditProfileModal from './EditProfileModal'

// ─────────────────────────────────────────────
// ACCOUNT PROFILE HEADER (client — handles edit modal + share)
//   Mirrors the mobile ProfileSection: avatar, username + bio,
//   then side-by-side Edit / Share buttons.
// ─────────────────────────────────────────────

type Props = {
  name: string
  username: string
  bio: string
  avatarUrl: string | null
}

const buttonClass =
  'h-10 flex-1 rounded-lg bg-[#2B282C] px-4 text-[14px] font-medium text-white shadow-sm shadow-black/5 transition-colors hover:bg-[#2B282C]/80 disabled:cursor-not-allowed disabled:opacity-50'

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

export default function AccountProfile({ name, username, bio, avatarUrl }: Props) {
  const [editOpen, setEditOpen] = useState(false)
  const [shareLabel, setShareLabel] = useState('Share Profile')
  const closeEdit = useCallback(() => setEditOpen(false), [])
  const { mode } = useTeamModeToggle()

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
      <div className="flex items-start gap-4 px-5 pt-6">
        <Avatar name={name || username} size="lg" photoUrl={avatarUrl} />

        <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
          <h2
            className="break-words text-[24px] font-bold leading-tight text-white"
            style={{ fontFamily: "'Sk Modernist', sans-serif", letterSpacing: '-0.02em' }}
          >
            {username || name}
          </h2>
          <span className="self-start">
            <PillTag label={teamModeLabel(mode)} size="sm" variant="ghost-green" />
          </span>
          {bio && (
            <p className="whitespace-pre-wrap text-[14px] leading-5 text-[#847E89]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {bio}
            </p>
          )}
        </div>

        <ModeToggle />
      </div>

      {/* ── CTA buttons ── */}
      <div className="flex gap-2.5 px-5 py-4">
        <button
          onClick={() => setEditOpen(true)}
          className={buttonClass}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Edit Profile
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

      {editOpen && (
        <EditProfileModal
          onClose={closeEdit}
          initialName={name}
          initialUsername={username}
          initialBio={bio}
          initialAvatarUrl={avatarUrl}
        />
      )}
    </div>
  )
}
