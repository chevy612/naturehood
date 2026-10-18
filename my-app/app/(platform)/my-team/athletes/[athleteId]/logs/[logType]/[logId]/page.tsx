import { notFound } from 'next/navigation'
import { LogDetail } from '@/app/components/platform/team/LogDetail'

export default async function AthleteLogPage({
  params,
}: {
  params: Promise<{ athleteId: string; logType: string; logId: string }>
}) {
  const { athleteId, logType, logId } = await params
  if (logType !== 'workout' && logType !== 'meal') notFound()
  return <LogDetail athleteId={athleteId} logType={logType} logId={logId} />
}
