'use client'

import { MotionDiv, fadeIn } from '@/components/shared/animations'
import { Document, Template } from '@/types'
import { CalendarIcon, DocumentIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

type DocumentWithTemplate = Omit<Document, 'template'> & {
  template: Pick<Template, 'id' | 'name' | 'description'> | null
}

interface RecentDocumentsProps {
  documents: DocumentWithTemplate[]
}

export function RecentDocuments({ documents }: RecentDocumentsProps) {
  const recentDocs = documents.slice(0, 5)

  return (
    <MotionDiv
      initial="initial"
      animate="animate"
      variants={fadeIn}
      className="overflow-hidden rounded-xl bg-white shadow ring-1 ring-gray-900/5"
    >
      <div className="p-6">
        <h2 className="text-base font-semibold leading-6 text-gray-900">Recent Documents</h2>
        <div className="mt-6 flow-root">
          <ul role="list" className="-my-5 divide-y divide-gray-100">
            {recentDocs.map((doc) => (
              <li key={doc.id} className="py-5">
                <div className="group relative flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 ring-1 ring-indigo-100">
                      <DocumentIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      <Link href={`/documents/${doc.id}`}>
                        <span className="absolute inset-0" aria-hidden="true" />
                        {doc.title}
                      </Link>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{doc.template?.name || 'Custom Document'}</p>
                    <div className="mt-2 flex items-center gap-x-4">
                      <div className="flex items-center gap-x-1 text-xs text-gray-500">
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          {new Date(doc.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          doc.status === 'completed'
                            ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                            : doc.status === 'draft'
                            ? 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10'
                            : 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10'
                        }`}
                      >
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {documents.length > 5 && (
            <div className="mt-6">
              <Link
                href="/documents"
                className="flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                View all documents
              </Link>
            </div>
          )}
        </div>
      </div>
    </MotionDiv>
  )
}
