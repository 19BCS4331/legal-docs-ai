export function Features() {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl lg:text-center">
        <h2 className="text-base font-semibold leading-7 text-indigo-600">Faster Documentation</h2>
        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Everything you need to create legal documents
        </p>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Our AI-powered platform helps you create professional legal documents in minutes, not hours.
        </p>
      </div>
      <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
          <div className="flex flex-col">
            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
              Smart Templates
            </dt>
            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
              <p className="flex-auto">
                AI-powered templates that adapt to your needs, ensuring all necessary clauses are included.
              </p>
            </dd>
          </div>
          <div className="flex flex-col">
            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
              Easy Customization
            </dt>
            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
              <p className="flex-auto">
                Modify and customize your documents with an intuitive interface.
              </p>
            </dd>
          </div>
          <div className="flex flex-col">
            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
              Instant Download
            </dt>
            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
              <p className="flex-auto">
                Download your documents instantly in PDF format, ready for signing.
              </p>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
