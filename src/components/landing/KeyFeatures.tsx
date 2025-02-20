'use client'

import { MotionDiv, fadeIn } from '@/components/shared/animations'
import { CloudArrowUpIcon, LockClosedIcon, ServerIcon } from '@heroicons/react/20/solid'

const features = [
  {
    name: 'AI-Powered Contract Generation',
    description:
      'Our advanced AI understands your needs and generates legally-sound contracts tailored to your specific requirements.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Secure & Confidential',
    description:
      'Your data is encrypted and protected. We maintain strict confidentiality standards to ensure your information stays private.',
    icon: LockClosedIcon,
  },
  {
    name: 'Instant Processing',
    description:
      'Generate contracts in minutes, not hours. Our system processes your requirements instantly and delivers professional results.',
    icon: ServerIcon,
  },
]

export function KeyFeatures() {
  return (
    <div className="overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <MotionDiv
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2"
        >
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base font-semibold leading-7 text-indigo-600">Create faster</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Better contracts</p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Create professional, legally-sound contracts in minutes. Our AI-powered platform helps you save time and money.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <feature.icon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" aria-hidden="true" />
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <MotionDiv
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="relative"
          >
            <img
              src="/images/features-img.png"
              alt="Product screenshot"
              className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
              width={1920}
              height={1080}
            />
          </MotionDiv>
        </MotionDiv>
      </div>
    </div>
  )
}
