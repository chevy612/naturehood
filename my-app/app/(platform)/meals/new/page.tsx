import { redirect } from 'next/navigation'
import { NewMealForm } from '@/app/components/platform/meals/NewMealForm'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Log a meal | Naturehood' }

export default async function NewMealPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <NewMealForm userId={user.id} />
}
