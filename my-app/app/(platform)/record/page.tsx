import RecordForm from './RecordForm'
import { getUserWorkoutTypes } from './actions'

export default async function RecordPage() {
  const previousTypes = await getUserWorkoutTypes()

  return (
    <div className="min-h-screen bg-[#141115] px-6 py-10">
      <div className="max-w-2xl mx-auto">

        <h1
          className="text-2xl font-bold text-white mb-8"
          style={{ fontFamily: "'Sk Modernist', sans-serif", letterSpacing: '-0.02em' }}
        >
          Log a Workout
        </h1>

        <RecordForm previousTypes={previousTypes} />
      </div>
    </div>
  )
}
