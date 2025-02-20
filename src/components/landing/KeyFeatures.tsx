import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'AI-Powered Contract Creation',
    description: 'Simply describe what you need, and our AI will generate a professional contract tailored to your requirements. From employment contracts to NDAs, we cover it all.',
    icon: DocumentTextIcon,
  },
  {
    name: 'Cost-Effective',
    description: 'Save thousands on lawyer fees. Create unlimited contracts at a fraction of the cost of traditional legal services.',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Legally Compliant',
    description: 'Our AI ensures all contracts follow current legal standards and regulations. Each template is crafted based on established legal frameworks.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Instant Generation',
    description: 'Get your contract in minutes, not days. No more waiting for lawyer appointments or lengthy drafting processes.',
    icon: ClockIcon,
  },
  {
    name: 'Multiple Contract Types',
    description: 'Access templates for various contracts: Service Agreements, Employment Contracts, NDAs, Rental Agreements, and many more.',
    icon: DocumentDuplicateIcon,
  },
  {
    name: 'Plain Language',
    description: "Contracts are written in clear, simple language while maintaining legal validity. Understand exactly what you're signing.",
    icon: ChatBubbleBottomCenterTextIcon,
  },
]

export function KeyFeatures() {
  return (
    <div className="py-24 sm:py-32 bg-white" id="features">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Why Choose Us</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Legal Contracts Made Simple
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Create legally-binding contracts without the complexity and cost of traditional legal services. Our AI handles the legal details while you focus on your business.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
