import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/app/components/platform/BottomNav'

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-[#141115]">
      {/* Offset content so it isn't hidden under the nav */}
      <main className="pb-16 md:pb-0 md:pl-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
