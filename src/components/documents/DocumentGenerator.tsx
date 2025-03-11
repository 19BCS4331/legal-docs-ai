'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Template } from '@/types'
import { TemplateSelector } from './TemplateSelector'
import { TemplateForm } from './TemplateForm'
import { CreditBadge } from './CreditBadge'
import { ProDocumentSettings } from './ProDocumentSettings'
import { MotionDiv, fadeIn } from '@/components/shared/animations'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getMemoizedContent, saveMemoizedContent } from '@/utils/aiMemoization'

interface DocumentGeneratorProps {
  templates: Template[]
  hasCredits: boolean
  credits: number
  userId: string
  userPlan?: 'free' | 'pro' | 'enterprise'
}

export default function DocumentGenerator({
  templates,
  hasCredits,
  credits,
  userId,
  userPlan,
}: DocumentGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [documentTitle, setDocumentTitle] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)

  const [writingTone, setWritingTone] = useState<'formal' | 'simple' | 'industry-specific'>('formal')
  const [customClauses, setCustomClauses] = useState<string[]>([])
  const [jurisdiction, setJurisdiction] = useState<string>('')
  const [isProUser] = useState(userPlan === 'pro' || userPlan === 'enterprise')

  const onSubmit = async (data: any) => {
    if (!hasCredits) {
      setError('You need credits to generate documents. Please purchase credits or upgrade your plan.')
      return
    }

    if (!selectedTemplate) {
      setError('Please select a template first')
      return
    }

    if(!documentTitle.trim()) {
      setError('Please enter a document title')
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
          model = 'gemini-2.0-flash'
          break
        default:
          model = 'gemini-1.5-flash'
      }

      // Model selected
      setProgress(30)

      console.log(`Starting document generation - User Plan: ${userPlan}, Model: ${model}`)

      if (typeof window === 'undefined') {
        throw new Error('Document generation is only available in the browser')
      }

      setError(null)
      setProgress(40)

      // Enhance prompt to request Markdown formatting
      let formattedPrompt = selectedTemplate.prompt_template
      
      // Replace each placeholder with its corresponding value
      Object.entries(data).forEach(([key, value]) => {
        formattedPrompt = formattedPrompt.replace(`{${key}}`, value as string)
      })

      // Build a structured prompt with clear instructions
      const fullPrompt = `${isProUser ? `Context:
- Writing Tone: ${writingTone}
${jurisdiction ? `- Jurisdiction: ${jurisdiction}` : ''}
${customClauses.length > 0 ? `- Required Clauses: ${customClauses.join(', ')}` : ''}

` : ''}Instructions:
1. You are a legal document assistant. Generate a professional and legally sound document.
2. Use Markdown formatting:
   - # for main titles
   - ## for subtitles
   - Standard Markdown for emphasis and lists
3. Include proper signature fields where needed
${jurisdiction ? `4. Ensure compliance with ${jurisdiction} laws and regulations
5. Include all required legal disclaimers for ${jurisdiction}` : ''}

Document Template:
${formattedPrompt}`

      // Log the prompt being sent
      console.log('Sending prompt to Gemini:', fullPrompt)
      setProgress(50)

      const isStreaming = userPlan === 'pro' || userPlan === 'enterprise'
      console.log(`Using ${isStreaming ? 'streaming' : 'non-streaming'} mode for ${model}`)

      try {
        const geminiModel = genAI.getGenerativeModel({ model })

        let content: string = ''

        // Check for memoized content first
        const memoizedContent = await getMemoizedContent(fullPrompt, model, 'document_generation', selectedTemplate.id)

        if (memoizedContent) {
          console.log('Using memoized document content')
          content = memoizedContent
        } else {
          console.log('Generating new document content')
          if (isStreaming) {
            // Handle streaming response
            const response = await geminiModel.generateContentStream([
              { text: fullPrompt }
            ])

            let fullText = ''
            let tokenCount = 0
            const expectedTokens = 1000 // Approximate expected tokens

            for await (const chunk of response.stream) {
              const chunkText = chunk.text()
              fullText += chunkText
              tokenCount += chunkText.split(/\s+/).length
              const newProgress = Math.min(60 + Math.round((tokenCount / expectedTokens) * 40), 95)
              setProgress(newProgress)
            }
            content = fullText

            // Save the generated content for future use
            await saveMemoizedContent(content, fullPrompt, model, 'document_generation', selectedTemplate.id)
          } else {
            // Handle non-streaming response
            setProgress(70)
            const response = await geminiModel.generateContent([
              { text: fullPrompt }
            ])
            setProgress(80)
            content = response.response.text()

            // Save the generated content for future use
            await saveMemoizedContent(content, fullPrompt, model, 'document_generation', selectedTemplate.id)
          }
        }

        // Process and store the generated document
        setProgress(90)

        console.log('Successfully generated document with Gemini')
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
          title: documentTitle || `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
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

      {/* Document Title Input */}
      <div className="mb-6">
        <label htmlFor="documentTitle" className="block text-sm font-medium text-gray-700">
          Document Title
        </label>
        <div className="relative">
          <input
            type="text"
            id="documentTitle"
            name="documentTitle"
            className={`w-full rounded-lg border-0 py-3 pl-4 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ${
              error === 'Please enter a document title'
                ? 'ring-red-500 focus:ring-red-500'
                : 'ring-gray-300 focus:ring-indigo-600'
            } placeholder:text-gray-400 focus:ring-2 focus:ring-inset`}
            placeholder="Enter document title"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
          />
          {error === 'Please enter a document title' && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        {error === 'Please enter a document title' && (
          <p className="mt-2 text-sm text-red-600" id="email-error">
            Please enter a document title
          </p>
        )}
      </div>


      <div className="rounded-lg border border-gray-200 bg-white shadow">
        <div className="grid grid-cols-1 gap-x-8 lg:grid-cols-3">
          {/* Template Selection */}
          <div className="px-4 py-6 sm:px-6 lg:border-r lg:border-gray-200">
            <TemplateSelector
              templates={templates}
              selectedTemplate={selectedTemplate}
              onSelect={setSelectedTemplate}
            />
          </div>

          {/* Template Form */}
          <div className="col-span-2 px-4 py-6 sm:px-6">
            {selectedTemplate && (
              <>
                {/* Pro Settings for pro/enterprise users */}
                {isProUser && (
                  <div className="mb-6">
                    <ProDocumentSettings
                      onToneChange={setWritingTone}
                      onClausesChange={setCustomClauses}
                      onJurisdictionChange={setJurisdiction}
                      defaultTone="formal"
                      defaultClauses={[]}
                      defaultJurisdiction=""
                    />
                  </div>
                )}
                
                <TemplateForm
                  template={selectedTemplate}
                  onSubmit={onSubmit}
                  isGenerating={isGenerating}
                  progress={progress}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </MotionDiv>
  )
}