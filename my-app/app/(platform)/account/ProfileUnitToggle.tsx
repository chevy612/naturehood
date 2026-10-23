'use client'

import { sans } from '@/lib/social/format'

type Props<T extends string> = {
  value: T
  options: readonly T[]
  onChange: (value: T) => void
  'aria-label': string
}

export default function ProfileUnitToggle<T extends string>({
  value,
  options,
  onChange,
  'aria-label': ariaLabel,
}: Props<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex shrink-0 overflow-hidden rounded-lg bg-[#1E1B1F] p-0.5"
      style={sans}
    >
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`min-w-[2.5rem] px-2.5 py-1.5 text-[12px] font-medium uppercase transition-colors ${
            value === opt ? 'rounded-md bg-[#3D3940] text-white' : 'text-[#847E89] hover:text-white'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
