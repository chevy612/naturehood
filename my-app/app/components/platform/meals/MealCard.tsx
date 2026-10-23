'use client'

import { Link } from '@/i18n/navigation'
import { ImageIcon } from 'lucide-react'
import { PillTag } from '@/app/components/ui/tags'
import { LogoSpinner } from '@/app/components/ui/logo-spinner'
import { sans } from '@/lib/social/format'
import { MEAL_TYPE_LABELS, type MealListItem } from '@/lib/meals/types'
import { dateKey, formatTime, weekdayForKey } from '@/lib/meals/utils'

export function MealCard({ meal, isAnalyzing = false }: { meal: MealListItem; isAnalyzing?: boolean }) {
  const key = dateKey(meal.created_at)
  const tags = [
    meal.meal_type ? MEAL_TYPE_LABELS[meal.meal_type] : null,
    meal.calories != null ? `${Math.round(meal.calories)} kcal` : null,
    meal.protein != null ? `protein ${Math.round(meal.protein)}g` : null,
    meal.carbs != null ? `carbs ${Math.round(meal.carbs)}g` : null,
    meal.fat != null ? `fat ${Math.round(meal.fat)}g` : null,
  ].filter((tag): tag is string => !!tag)

  const body = (
    <>
      <div className="mb-1.5 flex justify-between text-[11px] tracking-wide text-[#6B6870]" style={sans}>
        <span>{key}</span>
        <span>{weekdayForKey(key)} · {formatTime(meal.created_at)}</span>
      </div>
      <h3 className="mb-3 truncate text-[22px] font-bold leading-tight tracking-tight text-white" style={{ ...sans, letterSpacing: '-0.02em' }}>
        {meal.title || 'Untitled meal'}
      </h3>

      {isAnalyzing ? (
        <div className="mb-3 flex items-center gap-2" role="status">
          <LogoSpinner size={32} />
          <span className="text-[12px] text-[#A09EA3]" style={sans}>Analyzing your meal…</span>
        </div>
      ) : tags.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {tags.map((tag) => <PillTag key={tag} label={tag} variant="ghost-dark" />)}
        </div>
      ) : null}

      {meal.s3_link ? (
        // Meal photos are public Supabase storage URLs.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={meal.s3_link} alt="" loading="lazy" className="h-40 w-full rounded-lg object-cover" />
      ) : (
        <div className="flex h-40 w-full items-center justify-center rounded-lg bg-[#2B282C] text-[#6B6870]">
          <ImageIcon size={32} aria-hidden />
        </div>
      )}
    </>
  )

  const className = 'block rounded-2xl bg-[#1E1B1F] p-5 pb-4 transition-colors'

  if (isAnalyzing) {
    return <div aria-disabled className={`${className} opacity-85`}>{body}</div>
  }

  return (
    <Link href={`/meals/${meal.meal_id}`} className={`${className} hover:bg-[#242025]`}>
      {body}
    </Link>
  )
}
