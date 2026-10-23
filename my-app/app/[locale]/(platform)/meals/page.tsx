import { redirect } from '@/i18n/redirect'
import { Suspense } from 'react'
import { MealLog } from '@/app/components/platform/meals/MealLog'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Meals | Naturehood' }

export default async function MealsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return await redirect('/login')

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#141115]" />}>
      <MealLog userId={user.id} />
    </Suspense>
  )
}
