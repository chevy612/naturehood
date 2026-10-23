import { TeamTabs } from '@/app/components/platform/team/TeamTabs'

export default function MyTeamTabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#141115] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <h1
          className="mb-6 text-2xl font-bold text-white"
          style={{ fontFamily: "'Sk Modernist', sans-serif", letterSpacing: '-0.02em' }}
        >
          Team
        </h1>
        <TeamTabs />
        {children}
      </div>
    </div>
  )
}
