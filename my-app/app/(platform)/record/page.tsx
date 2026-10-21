import RecordForm from './RecordForm'
import { getUserWorkoutTypes } from './actions'

export default async function RecordPage() {
  const previousTypes = await getUserWorkoutTypes()

  return (
    // Extra bottom padding on phones clears the fixed action bar + BottomNav.
    <div className="min-h-screen bg-[#141115] px-4 pb-32 pt-6 sm:px-6 md:pb-10">
      <div className="mx-auto max-w-5xl">
        <h1
          className="mb-6 text-2xl font-bold leading-none text-white"
          style={{ fontFamily: "'Sk Modernist', sans-serif", letterSpacing: '-0.02em' }}
        >
          New workout
        </h1>

        <RecordForm previousTypes={previousTypes} />
      </div>
    </div>
  )
}
