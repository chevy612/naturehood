import { ShareLanding } from '@/app/components/platform/team/ShareLanding'

export default async function ShareTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return <ShareLanding token={token} />
}
