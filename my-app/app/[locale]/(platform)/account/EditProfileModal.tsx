'use client'

import { useRouter } from '@/i18n/navigation'
import { useEffect, useRef, useState, ChangeEvent } from 'react'
import { Camera, LogOut, X } from 'lucide-react'
import { Avatar } from '@/app/components/platform/Avatar'
import { LogoSpinner } from '@/app/components/ui/logo-spinner'
import { sans } from '@/lib/social/format'
import {
  ETHNICITY_LABELS,
  ETHNICITY_VALUES,
  displayToCm,
  displayToKg,
  formatHeightDisplay,
  formatWeightDisplay,
  GENDER_LABELS,
  GENDER_VALUES,
  type HeightUnit,
  type WeightUnit,
} from '@/lib/profile/body-metrics'
import { signOut, updateProfile, uploadAvatar } from './actions'
import ProfileUnitToggle from './ProfileUnitToggle'

// ─────────────────────────────────────────────
// EDIT PROFILE MODAL
//   Mirrors the mobile EditProfileModal: centred avatar with camera badge,
//   grouped fields card, sign-out row, and a full-width "Done" footer.
// ─────────────────────────────────────────────

const fieldLabel = 'text-[12px] text-[#847E89]'
const fieldInput =
  'w-full bg-transparent text-[16px] leading-5 text-white outline-none placeholder:text-[#847E89]/50'
const fieldSelect =
  'w-full bg-transparent text-[16px] leading-5 text-white outline-none'

// Mounted only while open, so fields start from the latest saved values each time.
export default function EditProfileModal({
  onClose,
  initialName,
  initialUsername,
  initialBio,
  initialAvatarUrl,
  initialGender,
  initialEthnicity,
  initialWeightKg,
  initialHeightCm,
}: {
  onClose: () => void
  initialName: string
  initialUsername: string
  initialBio: string
  initialAvatarUrl?: string | null
  initialGender: string | null
  initialEthnicity: string | null
  initialWeightKg: number | null
  initialHeightCm: number | null
}) {
  const router = useRouter()

  const [name, setName] = useState(initialName)
  const [username, setUsername] = useState(initialUsername)
  const [bio, setBio] = useState(initialBio)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl ?? null)
  const [gender, setGender] = useState(initialGender ?? '')
  const [ethnicity, setEthnicity] = useState(initialEthnicity ?? '')
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg')
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('cm')
  const [weight, setWeight] = useState(() => formatWeightDisplay(initialWeightKg, 'kg'))
  const [height, setHeight] = useState(() => formatHeightDisplay(initialHeightCm, 'cm'))
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Escape to close + lock body scroll while open.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
    if (!ALLOWED.includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are allowed.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2 MB.')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('avatar', file)
    const result = await uploadAvatar(formData)

    if ('error' in result) {
      setError(result.error)
    } else {
      setAvatarUrl(result.url)
      // Refresh the server component so the profile header also picks up the new avatar
      router.refresh()
    }

    setUploading(false)
    // Reset file input so the same file can be re-selected if needed
    e.target.value = ''
  }

  const handleWeightUnitChange = (unit: WeightUnit) => {
    if (unit === weightUnit) return
    const trimmed = weight.trim()
    if (trimmed) {
      const num = Number(trimmed)
      if (Number.isFinite(num)) {
        const kg = displayToKg(num, weightUnit)
        setWeight(formatWeightDisplay(kg, unit))
      }
    } else if (initialWeightKg != null) {
      setWeight(formatWeightDisplay(initialWeightKg, unit))
    }
    setWeightUnit(unit)
  }

  const handleHeightUnitChange = (unit: HeightUnit) => {
    if (unit === heightUnit) return
    const trimmed = height.trim()
    if (trimmed) {
      const num = Number(trimmed)
      if (Number.isFinite(num)) {
        const cm = displayToCm(num, heightUnit)
        setHeight(formatHeightDisplay(cm, unit))
      }
    } else if (initialHeightCm != null) {
      setHeight(formatHeightDisplay(initialHeightCm, unit))
    }
    setHeightUnit(unit)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('username', username)
    formData.append('bio', bio)
    formData.append('gender', gender)
    formData.append('ethnicity', ethnicity)
    formData.append('weight', weight)
    formData.append('height', height)
    formData.append('weight_unit', weightUnit)
    formData.append('height_unit', heightUnit)
    const result = await updateProfile(formData)

    setSaving(false)

    if (result?.error) {
      setError(result.error)
      return
    }
    router.refresh()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-stretch justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Edit Profile">
      <button type="button" aria-label="Close edit profile" onClick={onClose} className="absolute inset-0 bg-black/60" />

      <div className="relative flex h-full w-full max-w-md flex-col bg-[#141115] shadow-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-3xl sm:border sm:border-[#3D3940]">
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-[#3D3940] px-4 py-2">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-opacity hover:opacity-75"
          >
            <X size={24} />
          </button>
          <p className="text-[18px] text-white" style={sans}>Edit Profile</p>
          <div className="h-9 w-9" />
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* ── Avatar ── */}
          <div className="flex flex-col items-center pb-6 pt-8">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="relative focus:outline-none"
              aria-label="Change profile photo"
            >
              {uploading ? (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#2B282C]">
                  <LogoSpinner size={28} />
                </div>
              ) : (
                <Avatar name={name || username || 'U'} size="lg" photoUrl={avatarUrl} />
              )}
              <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#141115] bg-white text-[#141115]">
                <Camera size={14} />
              </span>
            </button>
            <p className="mt-3 text-[12px] text-[#847E89]" style={sans}>Tap to change photo</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* ── Fields ── */}
          <div className="mx-4 overflow-hidden rounded-2xl bg-[#2B282C]" style={sans}>
            <label className="flex flex-col gap-1 px-4 py-3">
              <span className={fieldLabel}>Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={fieldInput}
              />
            </label>
            <div className="h-px bg-[#3D3940]" />
            <label className="flex flex-col gap-1 px-4 py-3">
              <span className={fieldLabel}>Username</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className={fieldInput}
              />
            </label>
            <div className="h-px bg-[#3D3940]" />
            <label className="flex flex-col gap-1 px-4 py-3">
              <span className={fieldLabel}>Bio</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a short bio"
                maxLength={150}
                rows={2}
                className={`${fieldInput} min-h-[40px] resize-none`}
              />
            </label>
            <div className="h-px bg-[#3D3940]" />
            <label className="flex flex-col gap-1 px-4 py-3">
              <span className={fieldLabel}>Gender</span>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={fieldSelect}
              >
                <option value="" className="bg-[#2B282C] text-[#847E89]">Not set</option>
                {GENDER_VALUES.map((value) => (
                  <option key={value} value={value} className="bg-[#2B282C] text-white">
                    {GENDER_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>
            <div className="h-px bg-[#3D3940]" />
            <label className="flex flex-col gap-1 px-4 py-3">
              <span className={fieldLabel}>Ethnicity</span>
              <select
                value={ethnicity}
                onChange={(e) => setEthnicity(e.target.value)}
                className={fieldSelect}
              >
                <option value="" className="bg-[#2B282C] text-[#847E89]">Not set</option>
                {ETHNICITY_VALUES.map((value) => (
                  <option key={value} value={value} className="bg-[#2B282C] text-white">
                    {ETHNICITY_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>
            <div className="h-px bg-[#3D3940]" />
            <div className="flex flex-col gap-2 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className={fieldLabel}>Weight</span>
                <ProfileUnitToggle
                  value={weightUnit}
                  options={['kg', 'lb'] as const}
                  onChange={handleWeightUnitChange}
                  aria-label="Weight unit"
                />
              </div>
              <input
                type="text"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={weightUnit === 'kg' ? 'e.g. 72' : 'e.g. 160'}
                className={fieldInput}
              />
            </div>
            <div className="h-px bg-[#3D3940]" />
            <div className="flex flex-col gap-2 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className={fieldLabel}>Height</span>
                <ProfileUnitToggle
                  value={heightUnit}
                  options={['cm', 'in'] as const}
                  onChange={handleHeightUnitChange}
                  aria-label="Height unit"
                />
              </div>
              <input
                type="text"
                inputMode="decimal"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder={heightUnit === 'cm' ? 'e.g. 175' : 'e.g. 69'}
                className={fieldInput}
              />
            </div>
          </div>

          {error && (
            <p className="mt-3 px-4 text-[14px] text-[#FF4D4D]" style={sans}>{error}</p>
          )}

          {/* ── Sign out ── */}
          <form action={signOut} className="mx-4 mb-8 mt-10 overflow-hidden rounded-2xl bg-[#2B282C]">
            <button
              type="submit"
              className="flex h-12 w-full items-center px-4 text-[#FF4D4D] transition-opacity hover:opacity-70"
              style={sans}
            >
              <LogOut size={20} className="mr-3" />
              <span className="text-[14px] font-medium">Sign out</span>
            </button>
          </form>
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-[#3D3940] px-4 py-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || uploading}
            className="flex h-[52px] w-full items-center justify-center rounded-full bg-white text-[15px] font-semibold text-[#141115] transition-opacity hover:opacity-90 disabled:opacity-50"
            style={sans}
          >
            {saving ? <LogoSpinner size={20} color="#141115" /> : 'Done'}
          </button>
        </div>
      </div>
    </div>
  )
}
