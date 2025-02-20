'use client'

import { ChatBubbleLeftRightIcon, DocumentCheckIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { MotionDiv, fadeIn } from '@/components/shared/animations'

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
    <div className="relative isolate overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <MotionDiv
            initial="initial"
            animate="animate"
            variants={fadeIn}
          >
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Simple Process</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Create Your Contract in 3 Easy Steps
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              No legal expertise needed. Our AI-powered platform makes contract creation simple and straightforward.
            </p>
          </MotionDiv>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <MotionDiv
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16"
          >
            {steps.map((step) => (
              <div key={step.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <step.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {step.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">{step.description}</dd>
              </div>
            ))}
          </MotionDiv>
        </div>
      </div>
    </div>
  )
}
