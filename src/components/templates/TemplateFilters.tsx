'use client'

import { MotionDiv, fadeIn } from '@/components/shared/animations'
import { StarIcon } from '@heroicons/react/24/outline'

interface TemplateFiltersProps {
  subscription: {
    plan_type: string
    status: string
  } | null
}

export function TemplateFilters({ subscription }: TemplateFiltersProps) {
  const userPlan = subscription?.plan_type || 'free'

  return (
    <MotionDiv initial="initial" animate="animate" variants={fadeIn}>
      <div className="space-y-6">
        {/* Plan Status */}
        <div>
          <h3 className="text-base font-semibold text-gray-900">Your Plan</h3>
          <div className="mt-2 flex items-center space-x-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                userPlan === 'premium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {userPlan === 'premium' ? (
                <>
                  <StarIcon className="mr-1 h-3 w-3" />
                  Premium
                </>
              ) : (
                'Free'
              )}
            </span>
            {userPlan !== 'premium' && (
              <a
                href="/pricing"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
              >
                Upgrade
              </a>
            )}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-base font-semibold text-gray-900">Categories</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center">
              <input
                id="contracts"
                name="category"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
              <label htmlFor="contracts" className="ml-3 text-sm text-gray-600">
                Contracts
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="agreements"
                name="category"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
              <label htmlFor="agreements" className="ml-3 text-sm text-gray-600">
                Agreements
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="letters"
                name="category"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
              <label htmlFor="letters" className="ml-3 text-sm text-gray-600">
                Legal Letters
              </label>
            </div>
          </div>
        </div>

        {/* Access Level */}
        <div>
          <h3 className="text-base font-semibold text-gray-900">Access Level</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center">
              <input
                id="free"
                name="access"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
              <label htmlFor="free" className="ml-3 text-sm text-gray-600">
                Free Templates
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="premium"
                name="access"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
              <label htmlFor="premium" className="ml-3 flex items-center text-sm text-gray-600">
                Premium Templates
                <StarIcon className="ml-1 h-4 w-4 text-yellow-400" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </MotionDiv>
  )
}
