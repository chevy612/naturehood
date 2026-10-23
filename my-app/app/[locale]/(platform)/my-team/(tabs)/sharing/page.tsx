import { redirect } from '@/i18n/redirect'
import { SharingTab } from '@/app/components/platform/team/SharingTab'
import { getTeamMode } from '@/lib/team/mode-server'

export default async function SharingPage() {
  if ((await getTeamMode()) === 'coach') return await redirect('/my-team/message')
  return <SharingTab />
}
