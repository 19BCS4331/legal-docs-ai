'use client'

import { useState } from 'react'
import { UserCredits, UserSubscription } from '@/types'
import { CreditCardIcon, SparklesIcon, PlusCircleIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { PurchaseCreditsModal } from '../credits/PurchaseCreditsModal'
import { PurchasePlanModal } from '../pricing/PurchasePlanModal'

interface CreditBalanceProps {
  credits: UserCredits | null
  subscription: UserSubscription | null
}

export function CreditBalance({ credits, subscription }: CreditBalanceProps) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [localSubscription, setLocalSubscription] = useState(subscription)
  const [localCredits, setLocalCredits] = useState(credits)
  const router = useRouter()
  
  const planType = subscription?.plan_type || localSubscription?.plan_type || 'free'
  const isUpgradeable = planType === 'free' || planType === 'pro'
  const creditBalance = credits?.amount || localCredits?.amount || 0

  const handlePurchaseSuccess = () => {
    router.refresh()
  }

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
        
        <div className="flex flex-col space-y-3 mt-4">
          {isUpgradeable && (
            <button
              onClick={() => setShowPlanModal(true)}
              className="block w-full bg-indigo-600 text-white text-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Upgrade Plan
            </button>
          )}
          
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="w-full flex items-center justify-center py-2 px-4 border border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircleIcon className="h-4 w-4 mr-1" />
            Buy Additional Credits
          </button>
        </div>
      </div>

      {/* Purchase Credits Modal */}
      <PurchaseCreditsModal 
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onSuccess={handlePurchaseSuccess}
      />
      {/* Purchase Plan Modal */}
      <PurchasePlanModal 
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        currentPlan={planType}
        onSuccess={(newPlan) => {
          setLocalSubscription(newPlan);
          router.refresh();
        }}
      />
    </div>
  )
}
