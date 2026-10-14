import { sans } from '@/lib/social/format'

export function StatusMessage({
  children,
  tone = 'muted',
}: {
  children: React.ReactNode
  tone?: 'muted' | 'error'
}) {
  return (
    <p
      className={`py-10 text-center text-[14px] ${tone === 'error' ? 'text-[#FF4D4D]' : 'text-[#6B6870]'}`}
      style={sans}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      {children}
    </p>
  )
}
