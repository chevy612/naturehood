'use client'

import { useEffect, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { validateMealPhoto } from '@/lib/meals/browser'
import { sans } from '@/lib/social/format'

export function MealPhotoField({
  file,
  onChange,
  disabled = false,
}: {
  file: File | null
  onChange: (file: File | null) => void
  disabled?: boolean
}) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const previewRef = useRef<string | null>(null)

  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
  }, [])

  function replacePreview(next: string | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = next
    setPreview(next)
  }

  function handleSelect(next: File | undefined) {
    if (!next) return
    const problem = validateMealPhoto(next)
    setError(problem)
    if (problem) return
    replacePreview(URL.createObjectURL(next))
    onChange(next)
  }

  return (
    <div>
      {file && preview ? (
        <div className="relative overflow-hidden rounded-xl border border-[#3A373C]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Meal preview" className="h-56 w-full object-cover" />
          <button
            type="button"
            aria-label="Remove meal photo"
            disabled={disabled}
            onClick={() => {
              setError(null)
              replacePreview(null)
              onChange(null)
            }}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white disabled:opacity-40"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#3A373C] bg-[#1E1B1F] px-5 py-8 text-center ${disabled ? 'opacity-50' : 'cursor-pointer hover:border-[#6B6870]'}`}
          style={sans}
        >
          <ImagePlus size={22} className="text-[#A09EA3]" />
          <span className="text-[14px] text-[#A09EA3]">Snap or choose a meal photo</span>
          <span className="text-[11px] text-[#6B6870]">Cutlery in frame helps AI gauge portions</span>
          <input
            type="file"
            accept="image/*"
            aria-label="Meal photo"
            className="hidden"
            disabled={disabled}
            onChange={(event) => {
              handleSelect(event.target.files?.[0])
              event.target.value = ''
            }}
          />
        </label>
      )}
      {error ? (
        <p className="mt-2 text-[12px] text-[#FF4D4D]" style={sans} role="alert">{error}</p>
      ) : null}
    </div>
  )
}
