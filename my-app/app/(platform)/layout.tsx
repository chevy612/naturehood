import { BottomNav } from '@/app/components/platform/BottomNav'

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
