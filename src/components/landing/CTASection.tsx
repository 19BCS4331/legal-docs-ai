'use client'

import Link from 'next/link'
import { MotionDiv, fadeIn } from '@/components/shared/animations'
import { DocumentCheckIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

export function CTASection() {
  return (
    <div className="relative isolate overflow-hidden" id='cta-section'>
      {/* Background effect matching Hero section */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
      
      {/* Bottom background effect */}
      <div
        className="absolute inset-x-0 -bottom-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-bottom-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl lg:flex lg:px-8">
        {/* Left column */}
        <MotionDiv
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="px-6 pb-24 pt-20 sm:pb-32 lg:flex-1 lg:px-8 lg:pt-40"
        >
          <div className="mx-auto max-w-2xl lg:mx-0">
            <div className="max-w-xl">
              <div className="mt-24 sm:mt-32 lg:mt-16">
                <div className="inline-flex space-x-6">
                  <span className="rounded-full bg-indigo-600/10 px-3 py-1 text-sm font-semibold leading-6 text-indigo-600 ring-1 ring-inset ring-indigo-600/10">
                    What's new
                  </span>
                  <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-600">
                    <span>Just shipped v1.0</span>
                    <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
                <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Create Legal Contracts in Minutes
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Stop paying expensive legal fees. Our AI-powered platform helps you create professional, legally-sound contracts at a fraction of the cost.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    href="/auth"
                    className="rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200"
                  >
                    Get started
                  </Link>
                  <Link 
                    href="/pricing" 
                    className="group text-sm font-semibold leading-6 text-gray-900"
                  >
                    View pricing{' '}
                    <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </MotionDiv>

        {/* Right column */}
        <div className="flex items-center justify-center lg:flex-1 lg:px-8 lg:pt-20">
          <MotionDiv
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="relative w-full max-w-2xl"
          >
            {/* Stats cards */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 justify-items-center mb-5">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-indigo-500 to-indigo-600 p-8 shadow-xl w-11/12 sm:w-auto">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20" />
                <DocumentCheckIcon className="h-12 w-12 text-white mx-auto sm:mx-0" />
                <p className="mt-4 text-3xl font-bold text-white text-center sm:text-left">100K+</p>
                <p className="mt-2 text-sm font-medium text-indigo-100 text-center sm:text-left">Contracts Generated</p>
              </div>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-purple-500 to-purple-600 p-8 shadow-xl w-11/12 sm:w-auto">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20" />
                <CurrencyDollarIcon className="h-12 w-12 text-white mx-auto sm:mx-0" />
                <p className="mt-4 text-3xl font-bold text-white text-center sm:text-left">90%</p>
                <p className="mt-2 text-sm font-medium text-purple-100 text-center sm:text-left">Average Cost Savings</p>
              </div>
            </div>
          </MotionDiv>
        </div>
      </div>
    </div>
  )
}
