import { Link } from '@/i18n/navigation'
import { sans, display } from '@/lib/social/format'

export default function MealNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#141115] px-6 text-center">
      <h1 className="text-2xl font-bold text-white" style={{ ...display, letterSpacing: '-0.02em' }}>Meal not found</h1>
      <p className="mt-2 max-w-xs text-[14px] text-[#6B6870]" style={sans}>
        This meal doesn&apos;t exist or isn&apos;t yours to view.
      </p>
      <Link
        href="/meals"
        className="mt-8 rounded-full bg-[#F5F5F5] px-8 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-[#141115] hover:bg-white"
        style={sans}
      >
        Back to meals
      </Link>
    </div>
  )
}
