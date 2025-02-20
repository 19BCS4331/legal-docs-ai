'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createBrowserClient } from '@supabase/ssr'
import { MotionDiv, fadeIn } from '@/components/shared/animations'
import {
  PlusIcon,
  MinusIcon,
  DocumentTextIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

interface TemplateEditorProps {
  existingCategories: string[]
  userId: string
}

interface TemplateFormData {
  name: string
  description: string
  category: string
  newCategory?: string
  prompt_template: string
  available_in_plan: string[]
  required_fields: {
    name: string
    label: string
    type: string
    required: boolean
  }[]
}

export function TemplateEditor({ existingCategories, userId }: TemplateEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [useNewCategory, setUseNewCategory] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TemplateFormData>({
    defaultValues: {
      required_fields: [{ name: '', label: '', type: 'text', required: true }],
      available_in_plan: ['free'],
    },
  })

  const formData = watch()

  const addField = () => {
    const currentFields = watch('required_fields')
    setValue('required_fields', [
      ...currentFields,
      { name: '', label: '', type: 'text', required: true },
    ])
  }

  const removeField = (index: number) => {
    const currentFields = watch('required_fields')
    setValue(
      'required_fields',
      currentFields.filter((_, i) => i !== index)
    )
  }

  const getPreview = () => {
    let preview = formData.prompt_template
    formData.required_fields.forEach((field) => {
      preview = preview.replace(`{${field.name}}`, `[${field.label}]`)
    })
    return preview
  }

  const onSubmit = async (data: TemplateFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Use new category if specified
      const finalCategory = useNewCategory ? data.newCategory : data.category

      // Create template
      const { error: saveError } = await supabase.from('document_templates').insert({
        name: data.name,
        description: data.description,
        category: finalCategory,
        prompt_template: data.prompt_template,
        available_in_plan: data.available_in_plan,
        required_fields: data.required_fields.reduce((acc, field) => {
          acc[field.name] = {
            label: field.label,
            type: field.type,
            required: field.required,
          }
          return acc
        }, {} as Record<string, any>),
        created_by: userId,
      })

      if (saveError) throw saveError

      router.push('/templates')
    } catch (err: any) {
      setError(err.message || 'Failed to create template')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MotionDiv initial="initial" animate="animate" variants={fadeIn}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Basic Information */}
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                Template Name
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="name"
                  {...register('name', { required: 'Template name is required' })}
                  className="block w-full rounded-lg border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Description
              </label>
              <div className="mt-2">
                <textarea
                  id="description"
                  rows={3}
                  {...register('description', { required: 'Description is required' })}
                  className="block w-full rounded-lg border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">Category</label>
              <div className="mt-2 space-y-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    checked={!useNewCategory}
                    onChange={() => setUseNewCategory(false)}
                  />
                  <select
                    {...register('category')}
                    disabled={useNewCategory}
                    className="ml-2 block w-full rounded-lg border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                  >
                    {existingCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    checked={useNewCategory}
                    onChange={() => setUseNewCategory(true)}
                  />
                  <input
                    type="text"
                    {...register('newCategory')}
                    disabled={!useNewCategory}
                    placeholder="Enter new category"
                    className="ml-2 block w-full rounded-lg border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Available In Plans
              </label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('available_in_plan')}
                    value="free"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label className="ml-2 text-sm text-gray-900">Free Plan</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('available_in_plan')}
                    value="premium"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label className="ml-2 text-sm text-gray-900">Premium Plan</label>
                </div>
              </div>
            </div>
          </div>

          {/* Required Fields */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold leading-7 text-gray-900">Required Fields</h2>
                <button
                  type="button"
                  onClick={addField}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                  <PlusIcon className="mr-1.5 h-4 w-4" />
                  Add Field
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {formData.required_fields.map((field, index) => (
                  <div key={index} className="relative rounded-lg border p-4">
                    <div className="absolute right-2 top-2">
                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="rounded-md bg-white p-1 text-gray-400 hover:text-red-500"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Field Name</label>
                        <input
                          type="text"
                          {...register(`required_fields.${index}.name` as const, {
                            required: 'Field name is required',
                          })}
                          placeholder="e.g., client_name"
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Label</label>
                        <input
                          type="text"
                          {...register(`required_fields.${index}.label` as const, {
                            required: 'Label is required',
                          })}
                          placeholder="e.g., Client Name"
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Field Type</label>
                        <select
                          {...register(`required_fields.${index}.type` as const)}
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          <option value="text">Text</option>
                          <option value="textarea">Long Text</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="email">Email</option>
                        </select>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          {...register(`required_fields.${index}.required` as const)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label className="ml-2 text-sm text-gray-700">Required Field</label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Prompt Template */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Prompt Template</h2>
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              {previewMode ? (
                <>
                  <ArrowPathIcon className="mr-1.5 h-4 w-4" />
                  Edit Template
                </>
              ) : (
                <>
                  <DocumentTextIcon className="mr-1.5 h-4 w-4" />
                  Preview
                </>
              )}
            </button>
          </div>

          {previewMode ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">{getPreview()}</pre>
            </div>
          ) : (
            <div>
              <textarea
                rows={8}
                {...register('prompt_template', { required: 'Prompt template is required' })}
                className="block w-full rounded-lg border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                placeholder="Enter your prompt template here. Use {field_name} to reference input fields."
              />
              {errors.prompt_template && (
                <p className="mt-2 text-sm text-red-600">{errors.prompt_template.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center rounded-md bg-indigo-600 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="mr-3 h-5 w-5 animate-spin text-white"
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
                Creating Template...
              </>
            ) : (
              'Create Template'
            )}
          </button>
        </div>
      </form>
    </MotionDiv>
  )
}
