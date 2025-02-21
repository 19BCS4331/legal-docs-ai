import { UserCredits, UserSubscription } from '@/types'
import { CreditCardIcon, SparklesIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface CreditBalanceProps {
  credits: UserCredits | null
  subscription: UserSubscription | null
}

export function CreditBalance({ credits, subscription }: CreditBalanceProps) {
  const planType = subscription?.plan_type || 'free'
  const isUpgradeable = planType === 'free' || planType === 'pro'
  const creditBalance = credits?.amount || 0

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Account Status</h3>
      <div className="space-y-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <SparklesIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-900">Current Plan</p>
            <p className="text-2xl font-semibold text-indigo-600 capitalize">{planType}</p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CreditCardIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-900">Available Credits</p>
            <p className="text-2xl font-semibold text-indigo-600">{creditBalance}</p>
          </div>
        </div>
        {isUpgradeable && (
          <div className="mt-6">
            <Link
              href="/pricing"
              className="block w-full bg-indigo-600 text-white text-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Upgrade Plan
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
