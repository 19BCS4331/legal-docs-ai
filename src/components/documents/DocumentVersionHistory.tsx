'use client'

import { useState } from 'react'
import { DocumentVersion } from '@/types'
import { format } from 'date-fns'
import { ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface DocumentVersionHistoryProps {
  versions: DocumentVersion[]
  currentVersion: number
  onRestoreVersion: (version: DocumentVersion) => void
}

export function DocumentVersionHistory({
  versions,
  currentVersion,
  onRestoreVersion,
}: DocumentVersionHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mt-6 bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              Version History
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            {versions.map((version) => (
              <div
                key={version.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">
                      Version {version.version_number}
                    </span>
                    {version.version_number === currentVersion && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {version.change_summary || 'No change summary'}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Created on{' '}
                    {format(new Date(version.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                {version.version_number !== currentVersion && (
                  <button
                    type="button"
                    onClick={() => onRestoreVersion(version)}
                    className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-1" />
                    Restore
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
