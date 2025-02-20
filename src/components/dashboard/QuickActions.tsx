'use client'

import { MotionDiv, fadeIn } from '@/components/shared/animations'
import {
  DocumentPlusIcon,
  DocumentDuplicateIcon,
  TagIcon,
  ShareIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'

const actions = [
  {
    name: 'New Document',
    description: 'Create a new legal document',
    href: '/documents/new',
    icon: DocumentPlusIcon,
    color: 'bg-indigo-500',
  },
  {
    name: 'Templates',
    description: 'Browse document templates',
    href: '/templates',
    icon: DocumentDuplicateIcon,
    color: 'bg-purple-500',
  },
  {
    name: 'Manage Tags',
    description: 'Organize your documents',
    href: '/tags',
    icon: TagIcon,
    color: 'bg-blue-500',
  },
  {
    name: 'Shared With Me',
    description: 'View shared documents',
    href: '/documents?view=shared',
    icon: ShareIcon,
    color: 'bg-cyan-500',
  },
]

export function QuickActions() {
  return (
    <MotionDiv
      initial="initial"
      animate="animate"
      variants={fadeIn}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {actions.map((action) => (
        <Link
          key={action.name}
          href={action.href}
          className="group relative overflow-hidden rounded-lg bg-white p-6 shadow hover:shadow-md transition-all duration-200"
        >
          <div
            className={`absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 transform ${action.color} opacity-10 rounded-full group-hover:opacity-20 transition-opacity`}
          />
          <action.icon
            className={`h-8 w-8 ${action.color} text-white rounded-lg p-1.5`}
            aria-hidden="true"
          />
          <h3 className="mt-4 text-base font-semibold text-gray-900">
            {action.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {action.description}
          </p>
        </Link>
      ))}
    </MotionDiv>
  )
}
