'use client'

import { useState } from 'react'
import { ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Risk {
  severity: 'high' | 'medium' | 'low'
  description: string
  suggestion: string
}

interface DocumentAnalysisProps {
  documentContent: string
  onAnalyze: () => Promise<void>
  isAnalyzing: boolean
  risks: Risk[]
  summary: string | null
  isGeneratingSummary: boolean
  onGenerateSummary: () => Promise<void>
}

export function DocumentAnalysis({
  documentContent,
  onAnalyze,
  isAnalyzing,
  risks,
  summary,
  isGeneratingSummary,
  onGenerateSummary,
}: DocumentAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'risks' | 'summary'>('risks')
  const router = useRouter()

  const getSeverityColor = (severity: Risk['severity']) => {
    switch (severity) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const getSeverityIcon = (severity: Risk['severity']) => {
    switch (severity) {
      case 'high':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
      case 'medium':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
      case 'low':
        return <InformationCircleIcon className="h-5 w-5 text-green-400" />
      default:
        return null
    }
  }

  return (
    <div className="bg-white shadow sm:rounded-lg mt-8">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('risks')}
            className={`${
              activeTab === 'risks'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
          >
            Risk Analysis
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`${
              activeTab === 'summary'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
          >
            Document Summary
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'risks' ? (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Legal Risks and Suggestions</h3>
              <div className="flex flex-col sm:flex-row justify-end items-center gap-2 mt-4 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onAnalyze}
                  disabled={isAnalyzing}
                  className={`inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Risks'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/documents')}
                  className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View All Documents
                </button>
              </div>
            </div>

            {risks.length > 0 ? (
              <div className="mt-6 flow-root">
                <ul role="list" className="-my-5 divide-y divide-gray-200">
                  {risks.map((risk, index) => (
                    <li key={index} className="py-5">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          {getSeverityIcon(risk.severity)}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className={`text-sm font-medium ${getSeverityColor(risk.severity)}`}>
                              {risk.severity.charAt(0).toUpperCase() + risk.severity.slice(1)} Risk
                            </h3>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">{risk.description}</p>
                          <p className="mt-2 text-sm text-indigo-600">Suggestion: {risk.suggestion}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No risks analyzed</h3>
                <p className="mt-2 text-sm text-gray-500">Start by analyzing the document to see potential risks.</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Document Summary</h3>
              <button
                type="button"
                onClick={onGenerateSummary}
                disabled={isGeneratingSummary}
                className={`inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isGeneratingSummary ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isGeneratingSummary ? 'Generating...' : 'Generate Summary'}
              </button>
            </div>

            {summary ? (
              <div className="mt-6 prose prose-indigo">
                <p>{summary}</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No summary available</h3>
                <p className="mt-2 text-sm text-gray-500">Generate a summary to get an overview of the document.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
