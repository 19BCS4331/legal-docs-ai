export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          {/* Welcome Card Skeleton */}
          <div className="h-32 rounded-lg bg-gray-200" />
          
          {/* Quick Actions Skeleton */}
          <div className="space-y-4">
            <div className="h-7 w-32 rounded bg-gray-200" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-lg bg-gray-200" />
              ))}
            </div>
          </div>
          
          {/* Stats and Credit Balance Skeleton */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="h-48 rounded-lg bg-gray-200" />
            </div>
            <div className="lg:col-span-1">
              <div className="h-48 rounded-lg bg-gray-200" />
            </div>
          </div>
          
          {/* Recent Documents Skeleton */}
          <div className="space-y-4">
            <div className="h-7 w-32 rounded bg-gray-200" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-gray-200" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 