'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, Copy, Link2, Search, UserPlus, X } from 'lucide-react'
import { Avatar } from '@/app/components/platform/Avatar'
import { ButtonSmall } from '@/app/components/ui/buttons'
import { PeerRow } from '@/app/components/platform/team/PeerRow'
import {
  EmptyCard,
  ScopePills,
  ScopeSwitches,
  SectionLabel,
  StatusBadge,
  TeamLoading,
} from '@/app/components/platform/team/shared'
import { StatusMessage } from '@/app/components/platform/social/StatusMessage'
import {
  createShareLink,
  endShare,
  fetchCurrentUserId,
  inviteCoach,
  listMyShares,
  searchProfilesByUsername,
  teamErrorMessage,
  updateShareNote,
  updateShareOptions,
} from '@/lib/team/browser'
import { sans } from '@/lib/social/format'
import type { PeerProfile, ShareLink, ShareRow, ShareScope } from '@/lib/team/types'

const DEBOUNCE_MS = 300
const BOTH: ShareScope = { shareMeals: true, shareWorkouts: true }

function errorText(error: unknown, fallback: string) {
  return teamErrorMessage(error instanceof Error ? error : null, fallback)
}

function InviteCoach({ shares, onInvited }: { shares: ShareRow[]; onInvited: () => Promise<void> }) {
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PeerProfile[]>([])
  const [searching, setSearching] = useState(false)
  const [scope, setScope] = useState<ShareScope>(BOTH)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(input.trim()), DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [input])

  useEffect(() => {
    if (query.replace(/^@/, '').length < 2) {
      setResults([])
      setSearching(false)
      return
    }
    let cancelled = false
    setSearching(true)
    fetchCurrentUserId()
      .then((userId) => searchProfilesByUsername(query, userId))
      .then((profiles) => {
        if (!cancelled) {
          setResults(profiles)
          setError(null)
        }
      })
      .catch((searchError) => {
        if (!cancelled) {
          setResults([])
          setError(errorText(searchError, 'Search failed.'))
        }
      })
      .finally(() => {
        if (!cancelled) setSearching(false)
      })
    return () => {
      cancelled = true
    }
  }, [query])

  const existing = new Map(shares.map((share) => [share.peer_id, share.status]))

  async function handleInvite(profile: PeerProfile) {
    setPendingId(profile.id)
    setError(null)
    setNotice(null)
    try {
      await inviteCoach(profile.id, scope)
      setNotice(`Invite sent to @${profile.username}.`)
      setInput('')
      setResults([])
      await onInvited()
    } catch (inviteError) {
      setError(errorText(inviteError, 'Could not send the invite.'))
    } finally {
      setPendingId(null)
    }
  }

  return (
    <section className="rounded-2xl border border-[#3A373C] p-4" aria-label="Invite a Coach">
      <SectionLabel>Invite a Coach</SectionLabel>
      <div className="flex h-11 items-center gap-2 rounded-full bg-[#1E1B1F] px-4">
        <Search size={16} className="text-[#6B6870]" />
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Search by username…"
          aria-label="Search Coaches by username"
          className="w-full bg-transparent text-[14px] text-white outline-none placeholder:text-[#6B6870]"
          style={sans}
        />
        {input ? (
          <button type="button" aria-label="Clear search" onClick={() => setInput('')} className="text-[#6B6870]">
            <X size={16} />
          </button>
        ) : null}
      </div>

      <div className="mt-3">
        <p className="mb-2 text-[12px] text-[#6B6870]" style={sans}>What the Coach can see</p>
        <ScopeSwitches scope={scope} onChange={setScope} />
      </div>

      {searching ? <p className="mt-4 text-[13px] text-[#6B6870]" style={sans}>Searching…</p> : null}
      {!searching && query.replace(/^@/, '').length >= 2 && results.length === 0 && !error ? (
        <p className="mt-4 text-[13px] text-[#6B6870]" style={sans}>No users found for “{query}”.</p>
      ) : null}

      {results.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2" aria-label="Search results">
          {results.map((profile) => {
            const status = existing.get(profile.id)
            return (
              <li key={profile.id} className="flex items-center gap-3 rounded-xl bg-[#1E1B1F] px-3 py-2.5">
                <Avatar name={profile.name?.trim() || profile.username || '?'} photoUrl={profile.avatar_url} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-white" style={sans}>@{profile.username}</p>
                  {profile.name ? <p className="truncate text-[11px] text-[#6B6870]" style={sans}>{profile.name}</p> : null}
                </div>
                {status === 'accepted' || status === 'pending' ? (
                  <span className="text-[11px] uppercase tracking-[0.12em] text-[#6B6870]" style={sans}>
                    {status === 'accepted' ? 'Sharing' : 'Invited'}
                  </span>
                ) : (
                  <ButtonSmall variant="accent" onClick={() => handleInvite(profile)} disabled={pendingId === profile.id}>
                    <UserPlus size={12} />
                    {pendingId === profile.id ? 'Sending…' : 'Invite'}
                  </ButtonSmall>
                )}
              </li>
            )
          })}
        </ul>
      ) : null}

      {notice ? <p className="mt-3 text-[13px] text-[#F5F5F5]" style={sans} role="status">{notice}</p> : null}
      {error ? <p className="mt-3 text-[13px] text-[#FF4D4D]" style={sans} role="alert">{error}</p> : null}
    </section>
  )
}

function ShareLinkPanel() {
  const [scope, setScope] = useState<ShareScope>(BOTH)
  const [link, setLink] = useState<ShareLink | null>(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    setBusy(true)
    setError(null)
    setCopied(false)
    try {
      const userId = await fetchCurrentUserId()
      if (!userId) throw new Error('not_authenticated')
      setLink(await createShareLink(userId, scope))
    } catch (createError) {
      setError(errorText(createError, 'Could not create the link.'))
    } finally {
      setBusy(false)
    }
  }

  async function handleCopy() {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link.url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy. Select the link and copy it manually.')
    }
  }

  return (
    <section className="rounded-2xl border border-[#3A373C] p-4" aria-label="Share link">
      <SectionLabel>Share link</SectionLabel>
      <p className="mb-3 text-[13px] text-[#A09EA3]" style={sans}>
        Anyone who opens the link while signed in can accept and become your Coach. Share it only with people you trust.
      </p>
      <ScopeSwitches scope={scope} onChange={setScope} />
      <div className="mt-3">
        <ButtonSmall variant="accent" onClick={handleCreate} disabled={busy}>
          <Link2 size={12} />
          {busy ? 'Creating…' : link ? 'Create another link' : 'Create share link'}
        </ButtonSmall>
      </div>

      {link ? (
        <div className="mt-4 rounded-xl bg-[#1E1B1F] p-3">
          <div className="mb-2"><ScopePills scope={link} /></div>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={link.url}
              aria-label="Share link URL"
              onFocus={(event) => event.currentTarget.select()}
              className="min-w-0 flex-1 rounded-lg bg-[#141115] px-3 py-2 text-[12px] text-[#A09EA3] outline-none"
              style={sans}
            />
            <ButtonSmall onClick={handleCopy}>
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </ButtonSmall>
          </div>
        </div>
      ) : null}
      {error ? <p className="mt-3 text-[13px] text-[#FF4D4D]" style={sans} role="alert">{error}</p> : null}
    </section>
  )
}

export function SharingTab() {
  const [shares, setShares] = useState<ShareRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setShares(await listMyShares('athlete'))
      setError(null)
    } catch (loadError) {
      setError(errorText(loadError, 'Could not load your Coaches.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function runAction(shareId: string, action: () => Promise<void>) {
    setBusyId(shareId)
    setActionError(null)
    try {
      await action()
      await load()
    } catch (error) {
      setActionError(errorText(error, 'Something went wrong.'))
    } finally {
      setBusyId(null)
    }
  }

  const pending = shares.filter((share) => share.status === 'pending')
  const accepted = shares.filter((share) => share.status === 'accepted')

  function renderRow(share: ShareRow) {
    const scope: ShareScope = { shareMeals: share.share_meals, shareWorkouts: share.share_workouts }
    const busy = busyId === share.share_id
    return (
      <PeerRow
        key={share.share_id}
        peer={{ id: share.peer_id, username: share.peer_username, name: share.peer_name, avatar_url: share.peer_avatar_url }}
        note={share.my_note}
        notePlaceholder="Add a note about this Coach (only you can edit it)"
        onSaveNote={async (note) => {
          await updateShareNote(share.share_id, note)
          await load()
        }}
        badge={<StatusBadge status={share.status} />}
        details={
          <ScopeSwitches
            scope={scope}
            busy={busy}
            onChange={(next) => void runAction(share.share_id, () => updateShareOptions(share.share_id, next))}
          />
        }
        actions={
          <ButtonSmall variant="danger" disabled={busy} onClick={() => void runAction(share.share_id, () => endShare(share.share_id))}>
            {share.status === 'pending' ? 'Cancel invite' : 'Stop sharing'}
          </ButtonSmall>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <InviteCoach shares={shares} onInvited={load} />
      <ShareLinkPanel />

      {loading ? <TeamLoading /> : null}
      {!loading && error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
      {actionError ? <StatusMessage tone="error">{actionError}</StatusMessage> : null}

      {!loading && !error && shares.length === 0 ? (
        <EmptyCard title="You are not sharing with anyone yet" body="Invite a Coach by username or create a share link to let them see your logs." />
      ) : null}

      {pending.length > 0 ? (
        <section aria-label="Pending invites">
          <SectionLabel>Pending ({pending.length})</SectionLabel>
          <ul className="flex flex-col gap-3">{pending.map(renderRow)}</ul>
        </section>
      ) : null}

      {accepted.length > 0 ? (
        <section aria-label="Your Coaches">
          <SectionLabel>Your Coaches ({accepted.length})</SectionLabel>
          <ul className="flex flex-col gap-3">{accepted.map(renderRow)}</ul>
        </section>
      ) : null}
    </div>
  )
}
