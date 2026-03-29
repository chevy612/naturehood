import { WorkoutCard, type WorkoutCardLog, type WorkoutCardProfile } from './WorkoutCard'

type FeedLog = WorkoutCardLog & { profiles: WorkoutCardProfile | null }

export function FeedCard({ log }: { log: FeedLog }) {
  return (
    <WorkoutCard
      log={log}
      variant="feed"
      profile={log.profiles ?? undefined}
    />
  )
}
