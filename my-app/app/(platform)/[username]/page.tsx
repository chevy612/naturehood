import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RESERVED_SLUGS, BOT_TRAP_SLUGS } from '@/lib/username'
import { PillTag } from '@/app/components/ui/tags'
import { Avatar } from '@/app/components/platform/Avatar'

// ─────────────────────────────────────────────
// ROLE LABEL
// ─────────────────────────────────────────────

function roleLabel(role: string | null): string {
  if (role === 'brand') return 'Brand'
  if (role === 'other') return 'Explorer'
  return 'Athlete'
}

// ─────────────────────────────────────────────
// PUBLIC PROFILE PAGE
// ─────────────────────────────────────────────

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
    .select('name, username, bio, role, avatar_url')
    .eq('username', username)
    .maybeSingle()

  if (!profile) notFound()

  const name = profile.name ?? username

  return (
    <div className="min-h-screen bg-[#141115] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm text-center">

        {/* Avatar */}
        <div className="flex justify-center mb-5">
          <Avatar name={name} size="lg" photoUrl={profile.avatar_url ?? null} />
        </div>

        {/* Name */}
        <h1
          className="text-[28px] font-bold text-white leading-tight mb-1"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}
        >
          {name}
        </h1>

        {/* Username */}
        <p
          className="text-sm text-[#6B6870] mb-4"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          @{profile.username}
        </p>

        {/* Role badge */}
        <div className="flex justify-center mb-6">
          <PillTag label={roleLabel(profile.role)} size="sm" variant="ghost-green" />
        </div>

        {/* Bio */}
        {profile.bio && (
          <p
            className="text-[15px] text-[#A09EA3] leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {profile.bio}
          </p>
        )}

        {/* Footer */}
        <p
          className="mt-10 text-[11px] text-[#3A373C] uppercase tracking-[0.2em]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Member of Naturehood
        </p>

      </div>
    </div>
  )
}
