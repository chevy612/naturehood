import { redirect } from 'next/navigation'
import { TrackingTab } from '@/app/components/platform/team/TrackingTab'
import { getTeamMode } from '@/lib/team/mode-server'

export default async function TrackingPage() {
  if ((await getTeamMode()) === 'athlete') redirect('/my-team/sharing')
  return <TrackingTab />
}