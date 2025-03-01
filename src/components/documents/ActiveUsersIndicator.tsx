'use client'

import { DocumentPresence } from '@/types'
import { UserGroupIcon } from '@heroicons/react/24/outline'
import { Tooltip } from '@/components/shared/Tooltip'

interface ActiveUsersIndicatorProps {
  users?: DocumentPresence[];
}

export function ActiveUsersIndicator({ users = [] }: ActiveUsersIndicatorProps) {
  if (!users?.length) return null

  const displayedUsers = users.slice(0, 3);
  const remainingCount = Math.max(0, users.length - 3);

  return (
    <div 
      className={`flex items-center gap-1`}
    >
      <div className="flex -space-x-2">
        {displayedUsers.map((presence) => (
          <Tooltip 
            key={presence.id} 
            content={presence.user?.full_name || presence.user?.email || 'Unknown user'}
          >
            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white">
              {presence.user?.avatar_url ? (
                <img
                  className="h-full w-full rounded-full object-cover"
                  src={presence.user.avatar_url}
                  alt={presence.user?.full_name || presence.user?.email || 'User avatar'}
                />
              ) : (
                <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-500">
                  {(presence.user?.full_name || presence.user?.email || '?').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </Tooltip>
        ))}
        {remainingCount > 0 && (
          <Tooltip content={`${remainingCount} more active user${remainingCount === 1 ? '' : 's'}`}>
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white">
              <span className="text-xs font-medium text-gray-500">+{remainingCount}</span>
            </div>
          </Tooltip>
        )}
      </div>
      <UserGroupIcon className="h-5 w-5 text-gray-400" />
    </div>
  )
}
