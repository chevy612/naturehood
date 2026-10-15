import type { LogType } from '@/lib/team/types'

// Reserved mount point for the coach/athlete comment thread on a log card.
// The comments UI ships in a later phase; keep this component and its props stable.
export function LogCommentsSlot({
  logType,
  logId,
  athleteId,
}: {
  logType: LogType
  logId: string
  athleteId: string
}) {
  return (
    <div
      data-slot="log-comments"
      data-log-type={logType}
      data-log-id={logId}
      data-athlete-id={athleteId}
    />
  )
}
