'use client'

import { Link } from '@/i18n/navigation'
import { Avatar } from '@/app/components/platform/Avatar'
import type { UserSearchResult } from '@/lib/social/browser'
import { displayName, sans } from '@/lib/social/format'

export function UserSearchResults({ users }: { users: UserSearchResult[] }) {
  return (
    <ul aria-label="People results">
      {users.map((user) => {
        const name = user.name?.trim()
        return (
          <li key={user.id}>
            <Link
              href={`/home/profile/${user.id}`}
              className="flex items-center gap-3 border-b border-[#3A373C] py-3 transition-colors hover:bg-[#1E1B1F]"
            >
              <Avatar name={displayName(user, user.id)} photoUrl={user.avatar_url} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-white" style={sans}>
                  {name || `@${user.username}`}
                </p>
                {name ? (
                  <p className="truncate text-[13px] text-[#A09EA3]" style={sans}>@{user.username}</p>
                ) : null}
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
