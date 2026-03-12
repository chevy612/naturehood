'use client'

import { useRef, useState, ChangeEvent } from 'react'
import { Camera } from 'lucide-react'
import { Avatar } from '@/app/components/platform/Avatar'
import { InputDark, TextAreaDark } from '@/app/components/ui/inputs'
import { updateProfile, uploadAvatar } from './actions'


// ─────────────────────────────────────────────
// DASHBOARD EDIT FORM
// ─────────────────────────────────────────────

export default function DashboardEditForm({
  initialName,
  initialUsername,
  initialBio,
  initialAvatarUrl,
}: {
  initialName: string
  initialUsername: string
  initialBio: string
  initialAvatarUrl?: string | null
}) {
  const [name, setName] = useState(initialName)
  const [username, setUsername] = useState(initialUsername)
  const [bio, setBio] = useState(initialBio)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl ?? null)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarError(null)

    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
    if (!ALLOWED.includes(file.type)) {
      setAvatarError('Only JPEG, PNG, and WebP images are allowed.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Image must be smaller than 2 MB.')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('avatar', file)
    const result = await uploadAvatar(formData)

    if ('error' in result) {
      setAvatarError(result.error)
    } else {
      // Bust the CDN cache by appending a timestamp so next/image reloads
      setAvatarUrl(result.url + '?t=' + Date.now())
    }

    setUploading(false)
    // Reset file input so the same file can be re-selected if needed
    e.target.value = ''
  }

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

      {/* ── Avatar picker ── */}
      <div className="flex flex-col items-start gap-2">
        <p
          className="text-[11px] font-medium text-[#6B6870] uppercase tracking-[0.1em]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Profile photo
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="relative group focus:outline-none"
            aria-label="Change profile photo"
          >
            <Avatar name={name || 'U'} size="lg" photoUrl={avatarUrl} />
            {/* Camera overlay on hover */}
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
            </div>
            {uploading && (
              <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                <span className="text-[10px] font-semibold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Saving…
                </span>
              </div>
            )}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-[12px] font-medium text-[#C8F04D] hover:text-white transition-colors disabled:opacity-50"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {uploading ? 'Uploading…' : 'Change photo'}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />
        {avatarError && (
          <p className="text-[12px] text-[#FF4D4D]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {avatarError}
          </p>
        )}
      </div>

      {/* ── Profile fields ── */}
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
