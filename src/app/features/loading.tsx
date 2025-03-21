export default function FeaturesLoading() {
  return (
    <div className="bg-white">
      <div className="relative isolate pt-14">
        {/* Hero section skeleton */}
        <div className="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
          <div className="px-6 lg:px-0 lg:pt-4">
            <div className="mx-auto max-w-2xl">
              <div className="max-w-lg space-y-4 animate-pulse">
                <div className="h-12 w-3/4 bg-gray-200 rounded-lg" />
                <div className="h-6 w-full bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Primary features section skeleton */}
        <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center space-y-4 animate-pulse">
            <div className="h-8 w-1/3 mx-auto bg-gray-200 rounded" />
            <div className="h-6 w-2/3 mx-auto bg-gray-200 rounded" />
          </div>
          
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="h-8 w-2/3 bg-gray-200 rounded" />
                <div className="h-24 w-full bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Benefits section skeleton */}
        <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
          <div className="mx-auto max-w-2xl grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex gap-x-3 animate-pulse">
                <div className="h-6 w-6 bg-gray-200 rounded-full" />
                <div className="h-6 w-full bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 