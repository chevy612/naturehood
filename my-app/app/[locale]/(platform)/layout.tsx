import { redirect } from '@/i18n/redirect'
import { createClient } from '@/lib/supabase/server'
import { PlatformNav } from '@/app/components/platform/PlatformNav'
import { NotificationsProvider } from '@/app/components/platform/notifications/NotificationsProvider'
import { TeamModeProvider } from '@/app/components/platform/team/TeamModeProvider'

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return await redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, username, avatar_url, email, team_mode')
    .eq('id', user.id)
    .single()

  const navProfile = {
    name: profile?.name ?? profile?.email?.split('@')[0] ?? 'Member',
    username: profile?.username ?? null,
    avatarUrl: profile?.avatar_url ?? null,
  }

  return (
    <TeamModeProvider userId={user.id} initialMode={profile?.team_mode ?? null}>
      <NotificationsProvider userId={user.id}>
        <div className="min-h-screen bg-[#141115]">
          {/* Offset content so it isn't hidden under the nav */}
          <main className="pb-14 md:pb-0 md:pl-[var(--nh-sidebar-w)]">
            {children}
          </main>
          <PlatformNav profile={navProfile} />
        </div>
      </NotificationsProvider>
    </TeamModeProvider>
  );
}
