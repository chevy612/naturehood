'use client'

import { useCallback, useState } from 'react'
import { Avatar } from '@/app/components/platform/Avatar'
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

export default function AccountProfile({ name, username, bio, avatarUrl }: Props) {
  const [editOpen, setEditOpen] = useState(false)
  const [shareLabel, setShareLabel] = useState('Share Profile')
  const closeEdit = useCallback(() => setEditOpen(false), [])

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
          {bio && (
            <p className="whitespace-pre-wrap text-[14px] leading-5 text-[#847E89]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {bio}
            </p>
          )}
        </div>
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
