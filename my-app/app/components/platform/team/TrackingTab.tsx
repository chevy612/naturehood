'use client'

import { useCallback, useEffect, useState } from 'react'
import { ButtonSmall } from '@/app/components/ui/buttons'
import { PeerRow } from '@/app/components/platform/team/PeerRow'
import {
  EmptyCard,
  ScopePills,
  SectionLabel,
  StatusBadge,
  TeamLoading,
} from '@/app/components/platform/team/shared'
import { StatusMessage } from '@/app/components/platform/social/StatusMessage'
import { endShare, listMyShares, respondToShare, teamErrorMessage, updateShareNote } from '@/lib/team/browser'
import { sans } from '@/lib/social/format'
import type { ShareRow } from '@/lib/team/types'

function errorText(error: unknown, fallback: string) {
  return teamErrorMessage(error instanceof Error ? error : null, fallback)
}

export function TrackingTab() {
  const [shares, setShares] = useState<ShareRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setShares(await listMyShares('coach'))
      setError(null)
    } catch (loadError) {
      setError(errorText(loadError, 'Could not load the Athletes you track.'))
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
    } catch (actionFailure) {
      setActionError(errorText(actionFailure, 'Something went wrong.'))
    } finally {
      setBusyId(null)
    }
  }

  const pending = shares.filter((share) => share.status === 'pending')
  const accepted = shares.filter((share) => share.status === 'accepted')

  function renderRow(share: ShareRow) {
    const busy = busyId === share.share_id
    const isPending = share.status === 'pending'
    return (
      <PeerRow
        key={share.share_id}
        peer={{ id: share.peer_id, username: share.peer_username, name: share.peer_name, avatar_url: share.peer_avatar_url }}
        note={share.my_note}
        notePlaceholder="Add a note about this Athlete (only you can edit it)"
        onSaveNote={async (note) => {
          await updateShareNote(share.share_id, note)
          await load()
        }}
        href={isPending ? undefined : `/my-team/athletes/${share.peer_id}`}
        badge={<StatusBadge status={share.status} />}
        details={
          <div>
            <p className="mb-1.5 text-[11px] text-[#6B6870]" style={sans}>
              {isPending ? 'Offering to share' : 'Shared with you'}
            </p>
            <ScopePills scope={{ shareMeals: share.share_meals, shareWorkouts: share.share_workouts }} />
          </div>
        }
        actions={
          isPending ? (
            <>
              <ButtonSmall variant="accent" disabled={busy} onClick={() => void runAction(share.share_id, () => respondToShare(share.share_id, true))}>
                Accept
              </ButtonSmall>
              <ButtonSmall disabled={busy} onClick={() => void runAction(share.share_id, () => respondToShare(share.share_id, false))}>
                Decline
              </ButtonSmall>
            </>
          ) : (
            <ButtonSmall variant="danger" disabled={busy} onClick={() => void runAction(share.share_id, () => endShare(share.share_id))}>
              Stop tracking
            </ButtonSmall>
          )
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {loading ? <TeamLoading /> : null}
      {!loading && error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
      {actionError ? <StatusMessage tone="error">{actionError}</StatusMessage> : null}

      {!loading && !error && shares.length === 0 ? (
        <EmptyCard
          title="You are not tracking any Athletes"
          body="When an Athlete invites you or sends a share link, they show up here. Tap an Athlete to see their logs."
        />
      ) : null}

      {pending.length > 0 ? (
        <section aria-label="Pending invites">
          <SectionLabel>Invites ({pending.length})</SectionLabel>
          <ul className="flex flex-col gap-3">{pending.map(renderRow)}</ul>
        </section>
      ) : null}

      {accepted.length > 0 ? (
        <section aria-label="Athletes you track">
          <SectionLabel>Athletes ({accepted.length})</SectionLabel>
          <ul className="flex flex-col gap-3">{accepted.map(renderRow)}</ul>
        </section>
      ) : null}
    </div>
  )
}
