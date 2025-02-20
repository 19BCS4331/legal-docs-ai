'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Template } from '@/types'
import { TemplateSelector } from './TemplateSelector'
import { TemplateForm } from './TemplateForm'
import { CreditBadge } from './CreditBadge'
import { MotionDiv, fadeIn } from '@/components/shared/animations'

interface DocumentGeneratorProps {
  templates: Template[]
  hasCredits: boolean
  credits: number
  userId: string
}

export default function DocumentGenerator({
  templates,
  hasCredits,
  credits,
  userId,
}: DocumentGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const onSubmit = async (data: any) => {
    if (!hasCredits) {
      setError('You need credits to generate documents. Please purchase credits or upgrade your plan.')
      return
    }

    if (!selectedTemplate) {
      setError('Please select a template first')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Replace template variables with actual values
      let prompt = selectedTemplate.prompt_template
      Object.keys(data).forEach((key) => {
        prompt = prompt.replace(`{${key}}`, data[key])
      })

      // Generate document using OpenAI
      const response = await fetch('/api/generate-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          templateId: selectedTemplate.id,
          inputData: data,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to generate document')
      }

      const result = await response.json()

      // Save the document
      const { error: saveError } = await supabase.from('documents').insert({
        user_id: userId,
        template_id: selectedTemplate.id,
        title: `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
        content: result.content,
        input_data: data,
        status: 'completed',
      })

      if (saveError) throw saveError

      // Redirect to documents page
      router.push('/documents')
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the document')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <MotionDiv initial="initial" animate="animate" variants={fadeIn}>
      {/* Credit Badge */}
      <div className="mb-8">
        <CreditBadge credits={credits} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white shadow">
        <div className="grid grid-cols-1 gap-x-8 lg:grid-cols-3">
          {/* Template Selection */}
          <div className="border-b border-gray-200 p-6 lg:border-b-0 lg:border-r">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Choose Template</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Select a template that best fits your needs
            </p>
            <div className="mt-6">
              <TemplateSelector
                templates={templates}
                onSelect={setSelectedTemplate}
                selectedTemplate={selectedTemplate}
              />
            </div>
          </div>

          {/* Template Form */}
          <div className="col-span-2 p-6">
            {selectedTemplate ? (
              <TemplateForm
                template={selectedTemplate}
                onSubmit={onSubmit}
                isGenerating={isGenerating}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-gray-500">
                  Select a template from the left to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MotionDiv>
  )
}
