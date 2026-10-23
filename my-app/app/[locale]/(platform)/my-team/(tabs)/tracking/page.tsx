import { redirect } from '@/i18n/redirect'
import { TrackingTab } from '@/app/components/platform/team/TrackingTab'
import { getTeamMode } from '@/lib/team/mode-server'

export default async function TrackingPage() {
  if ((await getTeamMode()) === 'athlete') return await redirect('/my-team/sharing')
  return <TrackingTab />
}