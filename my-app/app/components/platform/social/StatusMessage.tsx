import { LogoSpinner } from '@/app/components/ui/logo-spinner'
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

export function SocialLoading({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex justify-center py-10" role="status" aria-busy="true" aria-label={label}>
      <LogoSpinner size={48} />
    </div>
  )
}

const loadMoreClass =
  'mt-6 w-full border border-[#3A373C] py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A09EA3] disabled:opacity-50'

export function LoadMoreButton({
  loading,
  disabled,
  onClick,
  className = loadMoreClass,
}: {
  loading: boolean
  disabled?: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled || loading} className={className} style={sans}>
      {loading ? (
        <span className="inline-flex w-full items-center justify-center" aria-hidden>
          <LogoSpinner size={28} />
        </span>
      ) : (
        'Load more'
      )}
    </button>
  )
}
