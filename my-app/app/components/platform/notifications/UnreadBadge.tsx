export function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <>
      <span
        aria-hidden
        className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F5F5F5] px-1 text-[9px] font-bold leading-none text-[#141115]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {count > 99 ? '99+' : count}
      </span>
      <span className="sr-only">{count} unread</span>
    </>
  )
}
