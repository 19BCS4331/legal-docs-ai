'use client'

import { useState, useMemo } from 'react'
import { TemplateFilters } from './TemplateFilters'
import { TemplateList } from './TemplateList'
import { Template } from '@/types'

interface TemplateStats {
  template_id: string
  count: number
}

interface TemplatesClientWrapperProps {
  templates: Template[]
  templateStats: TemplateStats[]
  userPlan: string
  isAdmin: boolean
  subscription: {
    plan_type: string
    status: string
  } | null
}

export function TemplatesClientWrapper({
  templates,
  templateStats,
  userPlan,
  isAdmin,
  subscription
}: TemplatesClientWrapperProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedAccessLevels, setSelectedAccessLevels] = useState<string[]>(['free'])

  // Extract unique categories from templates
  const uniqueCategories = useMemo(() => {
    const categories = templates.map(template => template.category)
    return Array.from(new Set(categories)).sort()
  }, [templates])

  const handleCategoryChange = (categories: string[]) => {
    setSelectedCategories(categories)
  }

  const handleAccessLevelChange = (accessLevels: string[]) => {
    setSelectedAccessLevels(accessLevels)
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
      {/* Filters */}
      <div className="lg:col-span-1">
        <TemplateFilters
          subscription={subscription}
          onCategoryChange={handleCategoryChange}
          onAccessLevelChange={handleAccessLevelChange}
          categories={uniqueCategories}
        />
      </div>

      {/* Template List */}
      <div className="lg:col-span-3">
        <TemplateList
          templates={templates}
          templateStats={templateStats}
          userPlan={userPlan}
          isAdmin={isAdmin}
          selectedCategories={selectedCategories}
          selectedAccessLevels={selectedAccessLevels}
        />
      </div>
    </div>
  )
}
