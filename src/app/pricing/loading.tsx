export default function PricingLoading() {
  return (
    <div className="bg-white">
      <div className="relative isolate pt-14">
        {/* Hero gradient background skeleton */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-gray-200 to-gray-300 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* Title and description skeleton */}
            <div className="mx-auto max-w-4xl text-center space-y-4">
              <div className="h-12 w-3/4 mx-auto bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-6 w-2/3 mx-auto bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Pricing cards skeleton */}
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-3xl p-8 ring-1 ring-gray-200 animate-pulse">
                  <div className="h-8 w-1/3 bg-gray-200 rounded mb-4" />
                  <div className="h-12 w-2/3 bg-gray-200 rounded mb-6" />
                  <div className="space-y-3">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="h-4 w-full bg-gray-200 rounded" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 