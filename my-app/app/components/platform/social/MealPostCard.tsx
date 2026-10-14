import { MEAL_TYPE_LABELS, type MealPostRecord } from '@/lib/social/post-content'
import { sans } from '@/lib/social/format'

export function MealPostCard({ meal }: { meal: MealPostRecord }) {
  const typeLabel = meal.meal_type ? MEAL_TYPE_LABELS[meal.meal_type] : 'Meal'
  const columns = [
    { label: 'kcal', value: meal.calories },
    { label: 'protein', value: meal.protein },
    { label: 'carbs', value: meal.carbs },
    { label: 'fat', value: meal.fat },
  ]

  return (
    <div className="flex gap-3 overflow-hidden rounded-2xl bg-[#1E1B1F] p-2">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#141115]">
        {meal.image_url ? (
          // User-uploaded meal photos are already public storage URLs.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={meal.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] text-[#6B6870]" style={sans}>
            Meal
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 py-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A09EA3]" style={sans}>
          {typeLabel}
        </p>
        <p className="mt-1 truncate text-[14px] text-white" style={sans}>
          {meal.title || 'Untitled meal'}
        </p>
        <div className="mt-2 grid grid-cols-4 gap-1">
          {columns.map((column) => (
            <div key={column.label} className="min-w-0 text-center">
              <p className="text-[12px] font-semibold text-white" style={sans}>
                {column.value != null ? Math.round(column.value) : '—'}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-[#6B6870]" style={sans}>
                {column.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
