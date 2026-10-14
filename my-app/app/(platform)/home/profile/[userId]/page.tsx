import { ProfilePosts } from '@/app/components/platform/social/ProfilePosts'

export default async function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  return <ProfilePosts userId={userId} />
}
