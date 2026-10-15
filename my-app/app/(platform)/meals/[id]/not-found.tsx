import Link from 'next/link'
import { sans } from '@/lib/social/format'

export default function MealNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#141115] px-6 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#F5F5F5]" style={sans}>Meals</p>
      <h1 className="mt-3 text-2xl font-bold text-white" style={{ ...sans, letterSpacing: '-0.02em' }}>Meal not found</h1>
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
