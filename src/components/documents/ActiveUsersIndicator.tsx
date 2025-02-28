'use client'

import { DocumentPresence } from '@/types'
import { UserGroupIcon } from '@heroicons/react/24/outline'
import { Tooltip } from '@/components/shared/Tooltip'

interface ActiveUsersIndicatorProps {
  activeUsers: DocumentPresence[]
  onClick?: () => void
}

export function ActiveUsersIndicator({ activeUsers, onClick }: ActiveUsersIndicatorProps) {
  if (!activeUsers.length) return null

  return (
    <div 
      className={`flex items-center gap-1 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex -space-x-2">
        {activeUsers.slice(0, 3).map((presence) => (
          <Tooltip 
            key={presence.id} 
            content={presence.user?.email || 'Unknown user'}
          >
            {presence.user?.avatar_url ? (
              <img
                className="relative z-10 inline-block h-8 w-8 rounded-full ring-2 ring-white"
                src={presence.user.avatar_url}
                alt={presence.user?.email || 'User avatar'}
              />
            ) : (
              <span className="relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-500 ring-2 ring-white">
                <span className="text-sm font-medium leading-none text-white">
                  {(presence.user?.email?.[0] || '?').toUpperCase()}
                </span>
              </span>
            )}
          </Tooltip>
        ))}
        {activeUsers.length > 3 && (
          <Tooltip content={`+${activeUsers.length - 3} more users`}>
            <span className="relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white">
              <span className="text-xs font-medium leading-none text-gray-500">
                +{activeUsers.length - 3}
              </span>
            </span>
          </Tooltip>
        )}
      </div>
      <UserGroupIcon className="h-5 w-5 text-gray-400" />
    </div>
  )
}
