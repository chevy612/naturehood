'use client'

import { useState, ChangeEvent } from 'react'
import { InputDark } from '@/app/components/ui/inputs'
import { updateProfile } from './actions'

// ─────────────────────────────────────────────
// DARK TEXTAREA
// Matches InputDark style
// ─────────────────────────────────────────────

function TextAreaDark({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string
  name: string
  value: string
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#6B6870]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-[#1E1B1F] border border-[#3A373C] focus:border-[#C8F04D] rounded-sm p-3 text-[15px] text-white placeholder:text-[#3A373C] outline-none resize-none transition-colors duration-200"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────
// DASHBOARD EDIT FORM
// ─────────────────────────────────────────────

export default function DashboardEditForm({
  initialUsername,
  initialBio,
}: {
  initialUsername: string
  initialBio: string
}) {
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
