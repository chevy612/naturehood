export default function PlatformLoading() {
  return (
    <div className="min-h-screen bg-[#141115] px-6 py-10">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-3 w-24 bg-[#3A373C] animate-pulse rounded" />
        <div className="h-6 w-48 bg-[#2A272B] animate-pulse rounded mt-6" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border border-[#3A373C] bg-[#1A1719] p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#3A373C] animate-pulse shrink-0" />
              <div className="h-4 w-3/4 bg-[#3A373C] animate-pulse rounded" />
            </div>
            <div className="h-3 w-1/2 bg-[#2A272B] animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
