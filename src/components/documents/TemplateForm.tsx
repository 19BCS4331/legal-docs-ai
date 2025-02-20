'use client'

import { Template } from '@/types'
import { MotionDiv, fadeIn } from '@/components/shared/animations'
import { useForm } from 'react-hook-form'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'

interface TemplateFormProps {
  template: Template
  onSubmit: (data: any) => Promise<void>
  isGenerating: boolean
}

export function TemplateForm({ template, onSubmit, isGenerating }: TemplateFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()


  return (
    <MotionDiv initial="initial" animate="animate" variants={fadeIn} className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold leading-7 text-gray-900">Document Information</h2>
      </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
            {Object.entries(template.required_fields).map(([key, field]) => {
              const isTextArea = field.type === 'textarea'
              const Component = isTextArea ? 'textarea' : 'input'

              return (
                <div key={key} className={isTextArea ? 'sm:col-span-2' : undefined}>
                  <label
                    htmlFor={key}
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative mt-2">
                    <Component
                      {...register(key, { required: field.required })}
                      type={field.type}
                      className={`w-full rounded-lg border-0 py-3 pl-4 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 ${
                        errors[key]
                          ? 'ring-red-300 placeholder:text-red-300 focus:ring-red-500'
                          : 'ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600'
                      } sm:text-sm sm:leading-6 ${isTextArea ? 'min-h-[100px]' : ''}`}
                    />
                    {errors[key] && (
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ExclamationCircleIcon
                          className="h-5 w-5 text-red-500"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                  </div>
                  {errors[key] && (
                    <p className="mt-2 text-sm text-red-600">This field is required</p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-end gap-x-6">
            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center rounded-md bg-indigo-600 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {isGenerating ? (
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
                  Generating...
                </>
              ) : (
                'Generate Document'
              )}
            </button>
          </div>
        </form>

    </MotionDiv>
  )
}
