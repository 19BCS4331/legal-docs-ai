'use client'

import { MotionDiv, fadeIn } from '@/components/shared/animations'
import {
  DocumentIcon,
  DocumentCheckIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'

interface DocumentStatsProps {
  stats: {
    total: number
    draft: number
    generated: number
    completed: number
  }
}

const statItems = [
  { name: 'Total', key: 'total', icon: DocumentTextIcon, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { name: 'Draft', key: 'draft', icon: DocumentIcon, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  {
    name: 'Generated',
    key: 'generated',
    icon: DocumentArrowUpIcon,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  {
    name: 'Completed',
    key: 'completed',
    icon: DocumentCheckIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
]

export function DocumentStats({ stats }: DocumentStatsProps) {
  return (
    <MotionDiv
      initial="initial"
      animate="animate"
      variants={fadeIn}
      className="rounded-xl bg-white shadow ring-1 ring-gray-900/5"
    >
      <div className="p-6">
        <h2 className="text-base font-semibold leading-6 text-gray-900">Document Statistics</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {statItems.map((item) => {
            const value = stats[item.key as keyof typeof stats]
            return (
              <div
                key={item.name}
                className="relative overflow-hidden rounded-lg border border-gray-100 p-4"
              >
                <dt>
                  <div className={`absolute rounded-lg ${item.bgColor} p-2`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} aria-hidden="true" />
                  </div>
                  <p className="ml-14 truncate text-sm font-medium text-gray-500">{item.name}</p>
                </dt>
                <dd className="ml-14 flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{value}</p>
                </dd>
                {/* Progress bar */}
                {item.key !== 'total' && stats.total > 0 && (
                  <div className="absolute bottom-0 left-0 right-0">
                    <div
                      className={`h-1 ${item.bgColor}`}
                      style={{ width: `${(value / stats.total) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </MotionDiv>
  )
}
