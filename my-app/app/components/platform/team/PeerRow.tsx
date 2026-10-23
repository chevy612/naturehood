'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { Pencil } from 'lucide-react'
import { Avatar } from '@/app/components/platform/Avatar'
import { ButtonSmall } from '@/app/components/ui/buttons'
import { NOTE_MAX_LENGTH, teamErrorMessage } from '@/lib/team/browser'
import { sans } from '@/lib/social/format'

export type PeerRowPeer = {
  id: string
  username: string | null
  name: string | null
  avatar_url: string | null
}

type PeerRowProps = {
  peer: PeerRowPeer
  note: string | null
  notePlaceholder: string
  onSaveNote: (note: string) => Promise<void>
  href?: string
  badge?: React.ReactNode
  details?: React.ReactNode
  actions?: React.ReactNode
}

function NoteEditor({
  initial,
  placeholder,
  onSave,
  onCancel,
}: {
  initial: string
  placeholder: string
  onSave: (note: string) => Promise<void>
  onCancel: () => void
}) {
  const [value, setValue] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await onSave(value)
      onCancel()
    } catch (saveError) {
      setError(teamErrorMessage(saveError instanceof Error ? saveError : null, 'Could not save the note.'))
      setSaving(false)
    }
  }

  return (
    <div className="relative z-10 mt-3">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value.slice(0, NOTE_MAX_LENGTH))}
        placeholder={placeholder}
        rows={2}
        maxLength={NOTE_MAX_LENGTH}
        aria-label="Description"
        autoFocus
        className="w-full resize-none rounded-xl bg-[#141115] px-4 py-3 text-[13px] text-white outline-none placeholder:text-[#6B6870] focus:ring-1 focus:ring-white/20"
        style={sans}
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-[11px] text-[#6B6870]" style={sans}>
          {value.length}/{NOTE_MAX_LENGTH}
        </span>
        <div className="flex gap-2">
          <ButtonSmall onClick={onCancel} disabled={saving}>Cancel</ButtonSmall>
          <ButtonSmall variant="accent" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </ButtonSmall>
        </div>
      </div>
      {error ? (
        <p className="mt-2 text-[12px] text-[#FF4D4D]" style={sans} role="alert">{error}</p>
      ) : null}
    </div>
  )
}

export function PeerRow({ peer, note, notePlaceholder, onSaveNote, href, badge, details, actions }: PeerRowProps) {
  const [editing, setEditing] = useState(false)
  const username = peer.username ? `@${peer.username}` : 'Unknown user'
  const avatarName = peer.name?.trim() || peer.username || '?'
  const avatar = <Avatar name={avatarName} photoUrl={peer.avatar_url} size="md" />

  return (
    <li
      className={`relative rounded-2xl bg-[#1E1B1F] p-4 ${href ? 'transition-colors hover:bg-[#252227]' : ''}`}
      data-testid="team-row"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0">{avatar}</div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {href ? (
              <Link
                href={href}
                aria-label={`Open ${username}`}
                className="truncate text-[15px] font-semibold text-white after:absolute after:inset-0 after:rounded-2xl after:content-['']"
                style={sans}
              >
                {username}
              </Link>
            ) : (
              <p className="truncate text-[15px] font-semibold text-white" style={sans}>{username}</p>
            )}
            {badge}
          </div>
          {peer.name && peer.name !== peer.username ? (
            <p className="truncate text-[12px] text-[#6B6870]" style={sans}>{peer.name}</p>
          ) : null}
          {!editing ? (
            <p
              className={`mt-1.5 whitespace-pre-wrap break-words text-[13px] ${note ? 'text-[#A09EA3]' : 'italic text-[#6B6870]'}`}
              style={sans}
              data-testid="team-row-note"
            >
              {note || 'No description yet'}
            </p>
          ) : null}
        </div>

        {!editing ? (
          <div className="relative z-10 shrink-0">
            <ButtonSmall onClick={() => setEditing(true)} ariaLabel={`Edit description for ${username}`}>
              <Pencil size={12} />
              Edit
            </ButtonSmall>
          </div>
        ) : null}
      </div>

      {editing ? (
        <NoteEditor
          initial={note ?? ''}
          placeholder={notePlaceholder}
          onSave={onSaveNote}
          onCancel={() => setEditing(false)}
        />
      ) : null}

      {details ? <div className="mt-3">{details}</div> : null}
      {actions ? <div className="relative z-10 mt-3 flex flex-wrap items-center gap-2">{actions}</div> : null}
    </li>
  )
}
