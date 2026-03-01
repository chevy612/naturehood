'use client'

import { useState, ChangeEvent } from 'react'
import { InputDark, TextAreaDark } from '@/app/components/ui/inputs'
import { updateProfile } from './actions'


// ─────────────────────────────────────────────
// DASHBOARD EDIT FORM
// ─────────────────────────────────────────────

export default function DashboardEditForm({
  initialName,
  initialUsername,
  initialBio,
}: {
  initialName: string
  initialUsername: string
  initialBio: string
}) {
  const [name, setName] = useState(initialName)
  const [username, setUsername] = useState(initialUsername)
  const [bio, setBio] = useState(initialBio)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateProfile(formData)

    if (result?.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Profile updated.' })
    }

    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InputDark
        label="Name"
        name="name"
        value={name}
        onChange={(e) => { setName(e.target.value); setMessage(null) }}
        placeholder="Your full name"
      />

      <InputDark
        label="Username"
        name="username"
        value={username}
        onChange={(e) => { setUsername(e.target.value); setMessage(null) }}
        placeholder="e.g. johndoe"
      />

      <TextAreaDark
        label="Bio"
        name="bio"
        value={bio}
        onChange={(e) => { setBio(e.target.value); setMessage(null) }}
        placeholder="Tell the world who you are..."
        rows={4}
      />

      {message && (
        <p
          className={`text-[13px] ${message.type === 'error' ? 'text-[#FF4D4D]' : 'text-[#C8F04D]'}`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-3 bg-[#C8F04D] text-[#141115] text-[13px] font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {submitting ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}
