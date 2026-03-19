import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import AiReportForm from './AiReportForm'
import type { TrainingLog } from '@/lib/types'

export default async function AiReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('training_logs')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) notFound()

  return (
    <div className="min-h-screen bg-[#141115] px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <p
          className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D] mb-10"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          AI Report
        </p>

        <h1
          className="text-2xl font-bold text-white mb-8"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}
        >
          Review Your Workout
        </h1>

        <AiReportForm workout={data as TrainingLog} />
      </div>
    </div>
  )
}
