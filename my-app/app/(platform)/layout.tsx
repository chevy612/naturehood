import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PlatformNav } from '@/app/components/platform/PlatformNav'
import { NotificationsProvider } from '@/app/components/platform/notifications/NotificationsProvider'

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, username, avatar_url, email')
    .eq('id', user.id)
    .single()

  const navProfile = {
    name: profile?.name ?? profile?.email?.split('@')[0] ?? 'Member',
    username: profile?.username ?? null,
    avatarUrl: profile?.avatar_url ?? null,
  }

  return (
    <NotificationsProvider userId={user.id}>
      <div className="min-h-screen bg-[#141115]">
        {/* Offset content so it isn't hidden under the nav */}
        <main className="pb-14 md:pb-0 md:pl-60">
          {children}
        </main>
        <PlatformNav profile={navProfile} />
      </div>
    </NotificationsProvider>
  );
}
