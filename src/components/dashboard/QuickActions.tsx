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
    href: '/documents?view=templates',
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
          className="group relative overflow-hidden rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all duration-200 hover:shadow-lg hover:ring-gray-900/10"
        >
          <div className="flex items-center gap-x-4">
            <div className={`p-2 rounded-lg ${action.color}`}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{action.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{action.description}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-current to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-10" />
        </Link>
      ))}
    </MotionDiv>
  )
}
