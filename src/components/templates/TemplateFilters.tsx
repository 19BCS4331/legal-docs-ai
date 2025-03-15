'use client'

import { MotionDiv, fadeIn } from '@/components/shared/animations'
import { StarIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { PurchasePlanModal } from '../pricing/PurchasePlanModal'

interface TemplateFiltersProps {
  subscription: {
    plan_type: string
    status: string
  } | null
  onCategoryChange: (categories: string[]) => void
  onAccessLevelChange: (accessLevels: string[]) => void
  categories: string[]
}

export function TemplateFilters({ 
  subscription, 
  onCategoryChange, 
  onAccessLevelChange,
  categories = []
}: TemplateFiltersProps) {
  const userPlan = subscription?.plan_type || 'free'
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedAccessLevels, setSelectedAccessLevels] = useState<string[]>(['free'])

  const handleCategoryChange = (category: string) => {
    const updatedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category]
    
    setSelectedCategories(updatedCategories)
    onCategoryChange(updatedCategories)
  }

  const handleAccessLevelChange = (level: string) => {
    const updatedLevels = selectedAccessLevels.includes(level)
      ? selectedAccessLevels.filter(l => l !== level)
      : [...selectedAccessLevels, level]
    
    setSelectedAccessLevels(updatedLevels)
    onAccessLevelChange(updatedLevels)
  }

  return (
    <MotionDiv initial="initial" animate="animate" variants={fadeIn}>
      <div className="space-y-6">
        {/* Plan Status */}
        <div>
          <h3 className="text-base font-semibold text-gray-900">Your Plan</h3>
          <div className="mt-2 flex items-center space-x-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                userPlan === 'pro' || userPlan === 'enterprise'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {userPlan === 'pro' || userPlan === 'enterprise' ? (
                <>
                  <StarIcon className="mr-1 h-3 w-3" />
                  {userPlan === 'pro' ? 'Pro' : 'Enterprise'}
                </>
              ) : (
                'Free'
              )}
            </span>
            {userPlan === 'free' && (
              <button
                onClick={() => setShowPlanModal(true)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-base font-semibold text-gray-900">Categories</h3>
          <div className="mt-4 space-y-4">
            {categories.map((category) => (
              <div key={category} className="flex items-center">
                <input
                  id={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                  name="category"
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label 
                  htmlFor={`category-${category.toLowerCase().replace(/\s+/g, '-')}`} 
                  className="ml-3 text-sm text-gray-600"
                >
                  {category}
                </label>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-gray-500">No categories available</p>
            )}
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
                checked={selectedAccessLevels.includes('free')}
                onChange={() => handleAccessLevelChange('free')}
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
                checked={selectedAccessLevels.includes('premium')}
                onChange={() => handleAccessLevelChange('premium')}
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

      {/* Purchase Plan Modal */}
      <PurchasePlanModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        currentPlan={userPlan}
        onSuccess={() => {
          setShowPlanModal(false);
          window.location.reload();
        }}
      />
    </MotionDiv>
  )
}
