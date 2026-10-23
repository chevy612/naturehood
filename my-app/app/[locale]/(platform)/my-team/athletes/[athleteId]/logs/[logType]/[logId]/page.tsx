import { notFound } from 'next/navigation'
import { LogDetail } from '@/app/components/platform/team/LogDetail'

export default async function AthleteLogPage({
  params,
  searchParams,
}: {
  params: Promise<{ athleteId: string; logType: string; logId: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const [{ athleteId, logType, logId }, query] = await Promise.all([params, searchParams])
  if (logType !== 'workout' && logType !== 'meal') notFound()
  return (
    <LogDetail
      athleteId={athleteId}
      logType={logType}
      logId={logId}
      initialTab={query.tab === 'comments' ? 'comments' : 'details'}
    />
  )
}
