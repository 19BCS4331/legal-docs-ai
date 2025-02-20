import { DocumentIcon } from '@heroicons/react/24/outline'

interface DocumentStatsProps {
  stats: {
    total: number
    draft: number
    generated: number
    completed: number
  }
}

export function DocumentStats({ stats }: DocumentStatsProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <DocumentIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="truncate text-sm font-medium text-gray-500">Total Documents</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{stats.total}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <div className="font-medium text-gray-500">Status Breakdown</div>
          <div className="mt-1 grid grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-900">{stats.draft}</span>
              <span className="ml-1 text-xs text-gray-500">Draft</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900">{stats.generated}</span>
              <span className="ml-1 text-xs text-gray-500">Generated</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900">{stats.completed}</span>
              <span className="ml-1 text-xs text-gray-500">Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
