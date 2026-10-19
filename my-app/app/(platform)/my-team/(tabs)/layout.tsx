import { TeamTabs } from '@/app/components/platform/team/TeamTabs'

export default function MyTeamTabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#141115] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <p
          className="mb-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#F5F5F5]"
          style={{ fontFamily: "'Sk Modernist', sans-serif" }}
        >
          Team
        </p>
        <TeamTabs />
        {children}
      </div>
    </div>
  )
}
