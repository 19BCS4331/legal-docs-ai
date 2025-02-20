'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { marked } from 'marked'

interface Template {
  id: string
  name: string
  description: string
  category: string
  prompt_template: string
  required_fields: {
    [key: string]: {
      type: string
      label: string
      required: boolean
    }
  }
}

interface DocumentGeneratorProps {
  templates: Template[]
  hasCredits: boolean
  userId: string
}

export default function DocumentGenerator({ templates, hasCredits, userId }: DocumentGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm()

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
      Object.keys(data).forEach(key => {
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
        throw new Error('Failed to generate document')
      }

      const result = await response.json()
      
      // Save the document
      const { error: saveError } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          template_id: selectedTemplate.id,
          title: `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
          content: result.content,
          input_data: data,
          status: 'completed',
        })

      if (saveError) throw saveError

      // Deduct credit
      const { error: creditError } = await supabase.rpc('deduct_credit', {
        user_id: userId,
        amount: 1,
      })

      if (creditError) throw creditError

      // Show preview
      setPreview(result.content)
      
      // Refresh the page to update credit count
      router.refresh()
    } catch (error: any) {
      console.error('Generation error:', error)
      setError(error.message || 'Failed to generate document. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Selection */}
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Template</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={`relative rounded-lg border p-4 text-left ${
                selectedTemplate?.id === template.id
                  ? 'border-indigo-600 ring-2 ring-indigo-600'
                  : 'border-gray-300'
              }`}
            >
              <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{template.description}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 mt-2 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {template.category}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Document Form */}
      {selectedTemplate && (
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Fill Document Details
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {Object.entries(selectedTemplate.required_fields).map(([field, config]) => (
              <div key={field}>
                <label
                  htmlFor={field}
                  className="block text-sm font-medium text-gray-700"
                >
                  {config.label}
                </label>
                {config.type === 'text' ? (
                  <textarea
                    {...register(field, { required: config.required })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                ) : (
                  <input
                    type={config.type}
                    {...register(field, { required: config.required })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                )}
                {errors[field] && (
                  <p className="mt-2 text-sm text-red-600">This field is required</p>
                )}
              </div>
            ))}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isGenerating || !hasCredits}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Generate Document'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Document Preview */}
      {preview && (
        <div className="bg-white shadow sm:rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Document Preview</h2>
            <button
              onClick={() => router.push('/documents')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View All Documents
            </button>
          </div>
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: marked(preview) }}
          />
        </div>
      )}
    </div>
  )
}
