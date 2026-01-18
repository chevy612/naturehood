import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Clock from '../components/clock'

export default async function HomePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Clock />
    </div>
  )
}
