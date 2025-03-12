export default function AboutLoading() {
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
                <div className="h-6 w-5/6 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats section skeleton */}
        <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
          <div className="mx-auto flex max-w-2xl flex-col gap-8 lg:mx-0 lg:mt-20 lg:max-w-none lg:flex-row lg:items-end">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-1 rounded-2xl bg-gray-50 p-8 animate-pulse">
                <div className="h-8 w-1/2 bg-gray-200 rounded mb-4" />
                <div className="h-10 w-2/3 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Values section skeleton */}
        <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="relative pl-9">
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-full bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 