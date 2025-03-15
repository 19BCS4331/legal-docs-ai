'use client'

import { Template } from '@/types'
import { MotionDiv, fadeIn } from '@/components/shared/animations'
import { useState } from 'react'
import {
  DocumentTextIcon,
  DocumentCheckIcon,
  ChevronRightIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import { PurchasePlanModal } from '../pricing/PurchasePlanModal'

interface TemplateSelectorProps {
  templates: Template[]
  onSelect: (template: Template) => void
  selectedTemplate: Template | null
  userPlan?: 'free' | 'pro' | 'enterprise'
}

export function TemplateSelector({ templates, onSelect, selectedTemplate, userPlan = 'free' }: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [selectedLockedTemplate, setSelectedLockedTemplate] = useState<Template | null>(null)
  const categories = [...new Set(templates.map((t) => t.category))]

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleTemplateClick = (template: Template) => {
    // Check if the user has access to this template based on their plan
    const hasAccess = template.available_in_plan.includes(userPlan)
    
    if (hasAccess) {
      onSelect(template)
    } else {
      // Store the template that was clicked
      setSelectedLockedTemplate(template)
      // Open the purchase plan modal
      setShowPlanModal(true)
    }
  }

  const isTemplateAccessible = (template: Template) => {
    return template.available_in_plan.includes(userPlan)
  }

  return (
    <MotionDiv initial="initial" animate="animate" variants={fadeIn}>
      <div className="relative">
        <input
          type="text"
          placeholder="Search templates..."
          className="w-full rounded-lg border-0 py-3 pl-4 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <DocumentTextIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {categories.map((category) => {
          const categoryTemplates = filteredTemplates.filter((t) => t.category === category)
          if (categoryTemplates.length === 0) return null

          return (
            <div key={category}>
              <h3 className="text-base font-semibold text-gray-900">{category}</h3>
              <div className="mt-3 grid grid-cols-1 gap-4">
                {categoryTemplates.map((template) => {
                  const isSelected = selectedTemplate?.id === template.id
                  const isAccessible = isTemplateAccessible(template)
                  const isPremium = template.available_in_plan.some(plan => plan === 'pro' || plan === 'enterprise') && 
                                   !template.available_in_plan.includes('free')
                  
                  return (
                    <div
                      key={template.id}
                      className={`relative cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                          : isAccessible 
                            ? 'border-gray-200 bg-white' 
                            : 'border-gray-200 bg-gray-50'
                      }`}
                      onClick={() => handleTemplateClick(template)}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`rounded-lg p-2 ${
                            isSelected ? 'bg-indigo-600' : isAccessible ? 'bg-gray-100' : 'bg-gray-200'
                          }`}
                        >
                          {isSelected ? (
                            <DocumentCheckIcon
                              className="h-6 w-6 text-white"
                              aria-hidden="true"
                            />
                          ) : !isAccessible ? (
                            <LockClosedIcon
                              className="h-6 w-6 text-gray-500"
                              aria-hidden="true"
                            />
                          ) : (
                            <DocumentTextIcon
                              className="h-6 w-6 text-gray-600"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-medium text-gray-900">{template.name}</h4>
                          <p className="mt-1 text-sm text-gray-500">{template.description}</p>
                          {isPremium && (
                            <div className="mt-2 flex items-center">
                              <StarIcon className="h-4 w-4 text-yellow-400" />
                              <span className="ml-1 text-xs font-medium text-gray-600">
                                {!isAccessible 
                                  ? `Upgrade to ${template.available_in_plan.includes('pro') ? 'Pro' : 'Enterprise'} to unlock` 
                                  : 'Premium Template'}
                              </span>
                            </div>
                          )}
                        </div>
                        <ChevronRightIcon
                          className={`h-5 w-5 ${
                            isSelected ? 'text-indigo-600' : isAccessible ? 'text-gray-400' : 'text-gray-300'
                          }`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <PurchasePlanModal 
        isOpen={showPlanModal} 
        onClose={() => setShowPlanModal(false)} 
        currentPlan={userPlan}
        onSuccess={() => {
          setShowPlanModal(false);
          // After upgrading, we would need to refresh the page to get the updated user plan
          window.location.reload();
        }}
      />
    </MotionDiv>
  )
}
