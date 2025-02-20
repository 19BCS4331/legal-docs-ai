import { ChatBubbleLeftRightIcon, DocumentCheckIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'

const steps = [
  {
    name: 'Describe Your Needs',
    description: 'Tell us what type of contract you need and provide basic details. No legal expertise required - just explain it in your own words.',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    name: 'AI Generates Contract',
    description: 'Our AI instantly creates a professional, legally-sound contract based on your requirements, following current legal standards.',
    icon: DocumentCheckIcon,
  },
  {
    name: 'Download & Use',
    description: 'Review your contract, make any adjustments if needed, and download it in your preferred format. Ready to use in minutes!',
    icon: DocumentArrowDownIcon,
  },
]

export function HowItWorks() {
  return (
    <div className="py-24 sm:py-32" id="how-it-works">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Simple Process</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Create Your Contract in 3 Easy Steps
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            No legal expertise needed. Our AI-powered platform makes contract creation simple and straightforward.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {steps.map((step) => (
              <div key={step.name} className="flex flex-col items-start">
                <div className="rounded-lg bg-gray-50 p-2 ring-1 ring-gray-200">
                  <step.icon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                </div>
                <dt className="mt-4 font-semibold text-gray-900">{step.name}</dt>
                <dd className="mt-2 leading-7 text-gray-600">{step.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
