import { redirect } from 'next/navigation'
import { SharingTab } from '@/app/components/platform/team/SharingTab'
import { getTeamMode } from '@/lib/team/mode-server'

export default async function SharingPage() {
  if ((await getTeamMode()) === 'coach') redirect('/my-team/message')
  return <SharingTab />
}
