// ─────────────────────────────────────────────
// AVATAR
// Shows a profile photo when photoUrl is provided,
// falls back to initials with lime ring.
// ─────────────────────────────────────────────

import Image from 'next/image'
import { getAvatarUrl } from '@/lib/storage'

const SIZES = {
  sm: { wrapper: 'w-8 h-8', text: 'text-[10px]', px: 40, css: '32px' },
  md: { wrapper: 'w-12 h-12', text: 'text-sm', px: 64, css: '48px' },
  lg: { wrapper: 'w-24 h-24', text: 'text-xl', px: 160, css: '96px' },
}

export function Avatar({
  name,
  size = 'md',
  photoUrl,
}: {
  name: string
  size?: 'sm' | 'md' | 'lg'
  photoUrl?: string | null
}) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const s = SIZES[size]
  const transformedUrl = getAvatarUrl(photoUrl, s.px)

  return (
    <div
      className={`relative ${s.wrapper} rounded-full overflow-hidden shrink-0 flex items-center justify-center ring-2 ring-[#C8F04D] bg-[#C8F04D]`}
    >
      {transformedUrl ? (
        <Image
          src={transformedUrl}
          alt={name}
          fill
          unoptimized
          className="object-cover"
          sizes={s.css}
        />
      ) : (
        <span
          className={`${s.text} font-bold select-none text-[#141115]`}
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {initials}
        </span>
      )}
    </div>
  )
}
