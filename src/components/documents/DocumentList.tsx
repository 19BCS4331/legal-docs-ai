import { Document } from '@/types'
import Link from 'next/link'
import { format } from 'date-fns'
import { DocumentIcon, ShareIcon, UserGroupIcon } from '@heroicons/react/24/outline'

type DocumentListProps = {
  documents: Document[]
  userId: string
}

export function DocumentList({ documents, userId }: DocumentListProps) {
  if (!documents.length) {
    return (
      <div className="text-center py-6">
        <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No documents</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new document.</p>
      </div>
    )
  }

  return (
    <ul role="list" className="divide-y divide-gray-200/80">
      {documents.map((document) => (
        <li
          key={document.id}
          className="group relative flex items-center space-x-4 px-4 py-4 sm:px-6 hover:bg-gray-50/50 transition-colors rounded-lg"
        >
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 group-hover:from-indigo-100 group-hover:to-purple-100 transition-colors">
              <DocumentIcon className="h-6 w-6 text-indigo-600/80 group-hover:text-indigo-600 transition-colors" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <Link href={`/documents/${document.id}`} className="focus:outline-none">
              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                {document.title || 'Untitled Document'}
              </p>
              <div className="mt-1 flex items-center space-x-4">
                <p className="text-sm text-gray-500 truncate">
                  {document.template?.name || 'No template'}
                </p>
                <span className="text-gray-300">·</span>
                <p className="text-sm text-gray-500">
                  Updated {format(new Date(document.updated_at), 'MMM d, yyyy')}
                </p>
              </div>
              
              {/* Document tags */}
              {document.tags && document.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {document.tags.map(tag => (
                    <span 
                      key={tag.id}
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs"
                      style={{ 
                        backgroundColor: `${tag.color}15`, // Very light background
                        color: tag.color,
                        border: `1px solid ${tag.color}30` // Light border
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </div>
          <div className="flex-shrink-0 flex items-center space-x-2">
            {/* Display badge based on shareType */}
            {document.user_id !== userId && (
              <>
                {document.shareType === 'collaboration' ? (
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                    <UserGroupIcon className="mr-1 h-3 w-3" /> Collaboration
                  </span>
                ) : document.shareType === 'shared' ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                    <ShareIcon className="mr-1 h-3 w-3" /> Shared
                  </span>
                ) : (
                  <ShareIcon className="h-5 w-5 text-gray-400" title="Shared with you" />
                )}
              </>
            )}
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </div>
        </li>
      ))}
    </ul>
  )
}
