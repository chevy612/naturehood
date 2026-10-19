import { Sidebar, type SidebarProfile } from '@/app/components/platform/Sidebar'
import { BottomNav } from '@/app/components/platform/BottomNav'

/** Mounts the desktop sidebar and the mobile bottom bar together. */
export function PlatformNav({ profile }: { profile: SidebarProfile }) {
  return (
    <>
      <Sidebar profile={profile} />
      <BottomNav />
    </>
  )
}
