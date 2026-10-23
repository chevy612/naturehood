import { AthleteLogs } from '@/app/components/platform/team/AthleteLogs'

export default async function AthletePage({ params }: { params: Promise<{ athleteId: string }> }) {
  const { athleteId } = await params
  return <AthleteLogs athleteId={athleteId} />
}
