'use client'

import { ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export function DocumentsHeader() {
  return (
    <header className="bg-gradient-to-b from-white to-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">Documents</h1>
            <p className="mt-1 text-sm text-gray-600">Manage and collaborate on your documents</p>
          </div>
          <div className="flex flex-col items-start space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
            <button
              className="inline-flex items-center gap-x-1.5 rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300/50 transition-all hover:shadow-md hover:ring-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => window.location.reload()}
            >
              <ArrowPathIcon className="h-4 w-4 mr-2 text-gray-600" />
              Refresh
            </button>
            <Link href="/documents/new">
              <button
                className="inline-flex items-center gap-x-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-purple-500 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Document
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
