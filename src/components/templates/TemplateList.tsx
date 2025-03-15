'use client'

import { Template } from '@/types'
import { MotionDiv, fadeIn } from '@/components/shared/animations'
import {
  StarIcon,
  DocumentIcon,
  ArrowTopRightOnSquareIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { PurchasePlanModal } from '../pricing/PurchasePlanModal'

interface TemplateStats {
  template_id: string
  count: number
}

interface TemplateListProps {
  templates: Template[]
  templateStats: TemplateStats[]
  userPlan: string
  isAdmin: boolean
  selectedCategories?: string[]
  selectedAccessLevels?: string[]
}

export function TemplateList({ 
  templates, 
  templateStats, 
  userPlan, 
  isAdmin,
  selectedCategories = [],
  selectedAccessLevels = ['free']
}: TemplateListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  // Get unique categories
  const categories = Array.from(new Set(templates.map((t) => t.category)))

  // Filter templates based on search, category, and access level
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = 
      !selectedCategory && selectedCategories.length === 0 || 
      selectedCategory === template.category ||
      (selectedCategories.length > 0 && selectedCategories.includes(template.category))

    // Check if template matches selected access levels
    const isPremium = template.available_in_plan.some(plan => plan === 'pro' || plan === 'enterprise') && 
                     !template.available_in_plan.includes('free')
    
    const matchesAccessLevel =
      selectedAccessLevels.length === 0 ||
      (selectedAccessLevels.includes('free') && !isPremium) ||
      (selectedAccessLevels.includes('premium') && isPremium)

    return matchesSearch && matchesCategory && matchesAccessLevel
  })

  // Group templates by category
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {} as Record<string, Template[]>)

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    setIsDeleting(templateId)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', templateId)

      if (error) throw error

      // Refresh the page to show updated list
      window.location.reload()
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Failed to delete template')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleTemplateClick = (template: Template) => {
    const isAccessible = template.available_in_plan.includes(userPlan)
    
    if (!isAccessible) {
      setSelectedTemplate(template)
      setShowPlanModal(true)
    }
  }

  return (
    <MotionDiv initial="initial" animate="animate" variants={fadeIn}>
      {/* Search and Category Filter */}
      <div className="mb-8 space-y-4">
        <div>
          <label htmlFor="search" className="sr-only">
            Search templates
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="search"
              name="search"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-lg border-0 py-3 pl-10 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              placeholder="Search templates..."
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              !selectedCategory
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                selectedCategory === category
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      <div className="space-y-8">
        {Object.entries(groupedTemplates).map(([category, templates]) => (
          <div key={category}>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">{category}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {templates.map((template) => {
                const stats = templateStats.find((s) => s.template_id === template.id)
                const isAccessible = template.available_in_plan.includes(userPlan)
                const isPremium = template.available_in_plan.some(plan => plan === 'pro' || plan === 'enterprise') && 
                                 !template.available_in_plan.includes('free')

                return (
                  <div
                    key={template.id}
                    className={`relative overflow-hidden rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow ${
                      !isAccessible ? 'opacity-85' : ''
                    }`}
                    onClick={!isAccessible ? () => handleTemplateClick(template) : undefined}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {template.name}
                          {isPremium && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                              <StarIcon className="mr-1 h-3 w-3" />
                              Premium
                            </span>
                          )}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">{template.description}</p>
                      </div>
                      {isAdmin && (
                        <div className="ml-4 flex items-center space-x-2">
                          <Link
                            href={`/templates/${template.id}/edit`}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-500"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(template.id);
                            }}
                            disabled={isDeleting === template.id}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-50 hover:text-red-500 disabled:opacity-50"
                          >
                            {isDeleting === template.id ? (
                              <svg
                                className="h-5 w-5 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            ) : (
                              <TrashIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <DocumentIcon className="mr-1 h-4 w-4" />
                          <span>{stats?.count || 0} uses</span>
                        </div>
                      </div>

                      {isAccessible ? (
                        <Link
                          href={`/documents/new?template=${template.id}`}
                          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Use template
                          <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleTemplateClick(template)}
                          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Upgrade to unlock
                          <StarIcon className="ml-1 h-4 w-4 text-yellow-400" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12">
            <div className="text-center">
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No templates found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </div>
        )}
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
