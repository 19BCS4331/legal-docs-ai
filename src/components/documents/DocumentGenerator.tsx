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
  const [progress, setProgress] = useState(0)
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
    setProgress(0)

    try {
      // Set initial progress
      setProgress(10)

      // First, verify credits and get user's plan
      const verifyResponse = await fetch('/api/generate-document/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
        }),
      })

      // Credits verified
      setProgress(20)

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to verify document generation')
      }

      const { userPlan } = await verifyResponse.json()

      // Select model based on user plan
      let model: string
      switch (userPlan) {
        case 'enterprise':
        case 'pro':
          model = 'claude-3-5-sonnet'
          break
        default:
          model = 'gemini-2.0-flash'
      }

      // Model selected
      setProgress(30)

      console.log(`Starting document generation - User Plan: ${userPlan}, Model: ${model}`)

      if (typeof window === 'undefined') {
        throw new Error('Document generation is only available in the browser')
      }

      const puter = (window as any).puter
      if (!puter) {
        throw new Error('Puter.js is not initialized')
      }

      setError('Initializing AI model... You may need to authorize access (one-time only)')
      setProgress(40)

      // Enhance prompt to request Markdown formatting
      let formattedPrompt = selectedTemplate.prompt_template
      
      // Replace each placeholder with its corresponding value
      Object.entries(data).forEach(([key, value]) => {
        formattedPrompt = formattedPrompt.replace(`{${key}}`, value as string)
      })

      formattedPrompt = `Please generate the following document using Markdown formatting. Use # for main titles, ## for subtitles, and standard Markdown syntax for emphasis, lists, etc. Also make sure to add proper signature fields:\n\n${formattedPrompt}`

      // Log the prompt being sent
      console.log('Sending prompt to Puter.js:', formattedPrompt)
      setProgress(50)

      const isStreaming = userPlan === 'pro' || userPlan === 'enterprise'
      console.log(`Using ${isStreaming ? 'streaming' : 'non-streaming'} mode for ${model}`)

      // Call Puter.js chat API
      const response = await puter.ai.chat(formattedPrompt, {
        model,
        stream: isStreaming,
        messages: [
          {
            role: 'system',
            content: 'You are a legal document assistant. Generate clear, professional, and legally sound documents based on the provided information.',
          },
          {
            role: 'user',
            content: formattedPrompt,
          },
        ],
      })

      // Request sent
      setProgress(60)

      // Log the response object
      console.log('Puter.js response:', response)

      let content: string = ''

      if (isStreaming && response && typeof response[Symbol.asyncIterator] === 'function') {
        // Handle streaming response (Claude)
        let fullText = ''
        let tokenCount = 0
        const expectedTokens = 1000 // Approximate expected tokens
        
        for await (const part of response) {
          console.log('Stream part:', part)
          if (part?.text) {
            fullText += part.text
            tokenCount += part.text.split(/\s+/).length
            const newProgress = Math.min(60 + Math.round((tokenCount / expectedTokens) * 40), 95)
            setProgress(newProgress)
          }
        }
        content = fullText
      } else {
        // Handle non-streaming response (Gemini)
        setProgress(70) // Processing response
        if (response && typeof response === 'object') {
          if ('text' in response) {
            // Claude format
            content = response.text
          } else if ('message' in response && response.message?.content) {
            // Gemini format
            setProgress(80)
            content = response.message.content
          } else if ('candidates' in response && Array.isArray(response.candidates) && response.candidates.length > 0) {
            // Alternative Gemini format
            setProgress(80)
            const candidate = response.candidates[0]
            if (candidate.content && candidate.content.parts && Array.isArray(candidate.content.parts)) {
              content = candidate.content.parts.map(part => part.text || '').join('\n')
            }
          } else if ('choices' in response && Array.isArray(response.choices) && response.choices.length > 0) {
            // Fallback format
            setProgress(80)
            content = response.choices[0].text || response.choices[0].message?.content
          }
          setProgress(90)
        }
      }

      if (!content) {
        console.error('Empty or invalid response from Puter.js:', JSON.stringify(response, null, 2))
        throw new Error('Failed to get content from AI model. Please try again.')
      }

      console.log('Successfully generated document with Puter.js')
      console.log('Content length:', content.length)
      console.log('Content preview:', content.substring(0, 100))
      setError(null)
      setProgress(95)

      // Log final generation details
      console.log('Document Generation Summary:', {
        userPlan,
        model,
        contentLength: content.length,
        timestamp: new Date().toISOString()
      })

      // Deduct credit
      const deductResponse = await fetch('/api/generate-document/deduct-credit', {
        method: 'POST',
      })

      if (!deductResponse.ok) {
        throw new Error('Failed to deduct credit')
      }

      // Save the document
      const { error: saveError } = await supabase.from('documents').insert({
        user_id: userId,
        template_id: selectedTemplate.id,
        title: `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
        content,
        input_data: data,
        status: 'completed',
      })

      if (saveError) throw saveError

      setProgress(100)

      // Redirect to documents page
      router.push('/documents')
    } catch (err: any) {
      console.error('Generation error:', err)
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
          {selectedTemplate && (
            <div className="col-span-2 p-6">
              <TemplateForm
                template={selectedTemplate}
                onSubmit={onSubmit}
                isGenerating={isGenerating}
                progress={progress}
              />
            </div>
          )}
        </div>
      </div>
    </MotionDiv>
  )
}