import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RESERVED_SLUGS, BOT_TRAP_SLUGS } from '@/lib/username'
import { ProfilePosts } from '@/app/components/platform/social/ProfilePosts'
import type { ProfileDetail } from '@/lib/social/browser'

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  // Guard reserved slugs and bot-trap paths before any DB query
  if (RESERVED_SLUGS.has(username)) notFound()
  if (BOT_TRAP_SLUGS.has(username.toLowerCase())) notFound()

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, username, bio, role, team_mode, avatar_url')
    .eq('username', username)
    .maybeSingle()

  if (!profile) notFound()

  return <ProfilePosts key={profile.id} userId={profile.id} initialProfile={profile as ProfileDetail} />
}
