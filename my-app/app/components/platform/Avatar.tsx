// ─────────────────────────────────────────────
// AVATAR
// Initials fallback with lime ring.
// Extracted from inline usage in account/page + [username]/page.
// ─────────────────────────────────────────────

const SIZES = {
  sm: { wrapper: 'w-8 h-8', text: 'text-[10px]' },
  md: { wrapper: 'w-12 h-12', text: 'text-sm' },
  lg: { wrapper: 'w-24 h-24', text: 'text-xl' },
}

export function Avatar({
  name,
  size = 'md',
}: {
  name: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const s = SIZES[size]

  return (
    <div
      className={`relative ${s.wrapper} rounded-full overflow-hidden shrink-0 flex items-center justify-center ring-2 ring-[#C8F04D] bg-[#C8F04D]`}
    >
      <span
        className={`${s.text} font-bold select-none text-[#141115]`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {initials}
      </span>
    </div>
  )
}
