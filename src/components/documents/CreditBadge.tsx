'use client'

import { MotionDiv, fadeIn } from '@/components/shared/animations'
import { SparklesIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface CreditBadgeProps {
  credits: number
}

export function CreditBadge({ credits }: CreditBadgeProps) {
  return (
    <MotionDiv
      initial="initial"
      animate="animate"
      variants={fadeIn}
      className="overflow-hidden rounded-lg bg-white shadow"
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <SparklesIcon className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900">Available Credits</h2>
              <p className="mt-1 text-sm text-gray-500">Each document generation uses 1 credit</p>
            </div>
          </div>
          <div className="ml-6 flex-shrink-0">
            <div
              className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium ${
                credits > 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {credits} credits
            </div>
          </div>
        </div>
        {credits === 0 && (
          <div className="mt-4">
            <Link
              href="/pricing"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Get More Credits
            </Link>
          </div>
        )}
      </div>
    </MotionDiv>
  )
}
