import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RecordForm from './RecordForm'

export default async function RecordPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-[#141115] px-6 py-10">
      <div className="max-w-2xl mx-auto">

        <p
          className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D] mb-10"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Record
        </p>

        <h1
          className="text-2xl font-bold text-white mb-8"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}
        >
          Log a Workout
        </h1>

        <RecordForm />
      </div>
    </div>
  )
}
