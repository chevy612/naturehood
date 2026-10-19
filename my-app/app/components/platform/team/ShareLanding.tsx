'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Avatar } from '@/app/components/platform/Avatar'
import { ScopePills, TeamLoading } from '@/app/components/platform/team/shared'
import { ButtonSmall } from '@/app/components/ui/buttons'
import { peekShareLink, redeemShareLink, teamErrorMessage } from '@/lib/team/browser'
import { sans, display } from '@/lib/social/format'
import type { ShareLinkInvalidReason, ShareLinkPeek } from '@/lib/team/types'

const INVALID_COPY: Record<ShareLinkInvalidReason, { title: string; body: string }> = {
  not_found: { title: 'Link not found', body: 'This share link is invalid. Ask the Athlete to send you a new one.' },
  inactive: { title: 'Link turned off', body: 'The Athlete turned this link off. Ask them for a new one.' },
  expired: { title: 'Link expired', body: 'This share link has expired. Ask the Athlete for a new one.' },
  own_link: { title: 'This is your own link', body: 'Send it to your Coach. You cannot accept your own share link.' },
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#141115] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-[#1E1B1F] p-8 text-center">{children}</div>
    </div>
  )
}

export function ShareLanding({ token }: { token: string }) {
  const router = useRouter()
  const [peek, setPeek] = useState<ShareLinkPeek | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [acceptError, setAcceptError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    peekShareLink(token)
      .then((result) => {
        if (!cancelled) setPeek(result)
      })
      .catch((error) => {
        if (!cancelled) setLoadError(teamErrorMessage(error instanceof Error ? error : null, 'Could not open this link.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  async function handleAccept() {
    setAccepting(true)
    setAcceptError(null)
    try {
      await redeemShareLink(token)
      router.push('/my-team/tracking')
    } catch (error) {
      setAcceptError(teamErrorMessage(error instanceof Error ? error : null, 'Could not accept this link.'))
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <Shell>
        <TeamLoading />
      </Shell>
    )
  }

  if (loadError) {
    return (
      <Shell>
        <p className="text-[14px] text-[#FF4D4D]" style={sans} role="alert">{loadError}</p>
      </Shell>
    )
  }

  if (!peek?.valid || !peek.athlete) {
    const copy = INVALID_COPY[peek?.reason ?? 'not_found']
    return (
      <Shell>
        <h1 className="text-[20px] font-bold text-white" style={display}>{copy.title}</h1>
        <p className="mt-2 text-[14px] text-[#A09EA3]" style={sans}>{copy.body}</p>
        <div className="mt-6 flex justify-center">
          <Link href="/my-team/tracking" className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#F5F5F5]" style={sans}>
            Go to Team
          </Link>
        </div>
      </Shell>
    )
  }

  const { athlete } = peek
  const handle = athlete.username ? `@${athlete.username}` : 'An Athlete'
  const alreadyTracking = peek.existing_status === 'accepted'

  return (
    <Shell>
      <div className="mb-5 flex justify-center">
        <Avatar name={athlete.name?.trim() || athlete.username || '?'} photoUrl={athlete.avatar_url} size="lg" />
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#F5F5F5]" style={display}>Share invite</p>
      <h1 className="mt-2 text-[22px] font-bold text-white" style={display}>{handle} wants you as their Coach</h1>
      {athlete.name && athlete.name !== athlete.username ? (
        <p className="mt-1 text-[13px] text-[#6B6870]" style={sans}>{athlete.name}</p>
      ) : null}
      <p className="mt-4 text-[13px] text-[#A09EA3]" style={sans}>If you accept, you will be able to see their:</p>
      <div className="mt-3 flex justify-center">
        <ScopePills scope={{ shareMeals: peek.share_meals, shareWorkouts: peek.share_workouts }} />
      </div>
      {alreadyTracking ? (
        <p className="mt-4 text-[12px] text-[#6B6870]" style={sans}>You already track this Athlete. Accepting keeps your access and never reduces it.</p>
      ) : null}

      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleAccept}
          disabled={accepting}
          className="w-full rounded-full bg-[#F5F5F5] px-6 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-[#141115] transition-colors hover:bg-white disabled:opacity-50"
          style={sans}
        >
          {accepting ? 'Accepting…' : 'Accept and start tracking'}
        </button>
        <ButtonSmall onClick={() => router.push('/my-team/tracking')} disabled={accepting}>Not now</ButtonSmall>
      </div>
      {acceptError ? <p className="mt-4 text-[13px] text-[#FF4D4D]" style={sans} role="alert">{acceptError}</p> : null}
    </Shell>
  )
}
