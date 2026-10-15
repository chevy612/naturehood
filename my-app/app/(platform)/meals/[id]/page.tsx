import { notFound, redirect } from 'next/navigation'
import { MealEditor } from '@/app/components/platform/meals/MealEditor'
import { createClient } from '@/lib/supabase/server'
import type { MealRecord } from '@/lib/meals/types'

export const metadata = { title: 'Meal | Naturehood' }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function MealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID.test(id)) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // meal_records is readable by every signed-in user, so ownership is enforced here.
  const { data: meal } = await supabase
    .from('meal_records')
    .select('meal_id, user_id, title, weight, calories, protein, carbs, fat, meal_type, user_notes, ai_analysis, s3_link, created_at, updated_at')
    .eq('meal_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!meal) notFound()

  return <MealEditor key={meal.updated_at ?? meal.created_at} meal={meal as MealRecord} userId={user.id} />
}
