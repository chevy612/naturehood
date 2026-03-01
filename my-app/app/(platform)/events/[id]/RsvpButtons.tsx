'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SuccessModal } from '@/app/components/ui/notification'
import { rsvpEvent, cancelRsvp } from '../actions'

// ─────────────────────────────────────────────
// RSVP BUTTONS
// Client component to handle RSVP / cancel with feedback.
// ─────────────────────────────────────────────

export default function RsvpButtons({
  eventId,
  userSignedUp,
  isFull,
}: {
  eventId: string
  userSignedUp: boolean
  isFull: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleRsvp = async () => {
    setLoading(true)
    setError(null)
    const result = await rsvpEvent(eventId)
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setShowSuccess(true)
    }
  }

  const handleCancel = async () => {
    setLoading(true)
    setError(null)
    const result = await cancelRsvp(eventId)
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      router.refresh()
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        {!userSignedUp && (
          <button
            onClick={handleRsvp}
            disabled={loading || isFull}
            className="bg-[#C8F04D] text-[#141115] px-8 py-4 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#b8e038] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {loading ? 'Signing up…' : 'Sign Up'}
          </button>
        )}

        {userSignedUp && (
          <button
            onClick={handleCancel}
            disabled={loading}
            className="border border-[#3A373C] text-[#6B6870] px-8 py-4 text-[11px] font-bold tracking-[0.2em] uppercase hover:border-[#FF4D4D] hover:text-[#FF4D4D] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {loading ? 'Cancelling…' : 'Cancel Sign-Up'}
          </button>
        )}
      </div>

      {error && (
        <p
          className="mt-3 text-[13px] text-[#FF4D4D]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {error}
        </p>
      )}

      {showSuccess && (
        <SuccessModal
          variant="dark"
          title="You're signed up!"
          message="We'll see you there. Check back for event updates."
          onClose={() => { setShowSuccess(false); router.refresh() }}
        />
      )}
    </>
  )
}
