'use client'

import { useState } from 'react'
import { Switch } from '@headlessui/react'
import { PencilIcon, TrashIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

interface ProDocumentSettingsProps {
  onToneChange: (tone: 'formal' | 'simple' | 'industry-specific') => void
  onClausesChange: (clauses: string[]) => void
  onJurisdictionChange: (jurisdiction: string) => void
  defaultTone?: 'formal' | 'simple' | 'industry-specific'
  defaultClauses?: string[]
  defaultJurisdiction?: string
}

export function ProDocumentSettings({
  onToneChange,
  onClausesChange,
  onJurisdictionChange,
  defaultTone = 'formal',
  defaultClauses = [],
  defaultJurisdiction = '',
}: ProDocumentSettingsProps) {
  const [selectedTone, setSelectedTone] = useState(defaultTone)
  const [clauses, setClauses] = useState(defaultClauses)
  const [newClause, setNewClause] = useState('')
  const [jurisdiction, setJurisdiction] = useState(defaultJurisdiction)

  const handleToneChange = (tone: 'formal' | 'simple' | 'industry-specific') => {
    setSelectedTone(tone)
    onToneChange(tone)
  }

  const handleJurisdictionChange = (value: string) => {
    setJurisdiction(value)
    onJurisdictionChange(value)
  }

  const addClause = () => {
    if (newClause.trim()) {
      const updatedClauses = [...clauses, newClause.trim()]
      setClauses(updatedClauses)
      onClausesChange(updatedClauses)
      setNewClause('')
    }
  }

  const removeClause = (index: number) => {
    const updatedClauses = clauses.filter((_, i) => i !== index)
    setClauses(updatedClauses)
    onClausesChange(updatedClauses)
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Document Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Customize how your legal document is generated
        </p>
      </div>

      {/* Jurisdiction Input */}
      <div>
        <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700">
          Jurisdiction
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <GlobeAltIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            name="jurisdiction"
            id="jurisdiction"
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="e.g., United States, California or India, Maharashtra"
            value={jurisdiction}
            onChange={(e) => handleJurisdictionChange(e.target.value)}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Specify the jurisdiction to ensure compliance with local laws
        </p>
      </div>

      {/* Writing Tone Selection */}
      <div>
        <label className="text-sm font-medium text-gray-700">Writing Tone</label>
        <div className="mt-2 space-y-4">
          {['formal', 'simple', 'industry-specific'].map((tone) => (
            <div key={tone} className="flex items-center">
              <input
                type="radio"
                name="tone"
                value={tone}
                checked={selectedTone === tone}
                onChange={() => handleToneChange(tone as any)}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
              />
              <label htmlFor={tone} className="ml-3 block text-sm font-medium text-gray-700 capitalize">
                {tone.replace('-', ' ')}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Clauses */}
      <div>
        <label className="text-sm font-medium text-gray-700">Custom Clauses</label>
        <div className="mt-2">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newClause}
              onChange={(e) => setNewClause(e.target.value)}
              placeholder="Enter a custom clause"
              className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              onKeyPress={(e) => e.key === 'Enter' && addClause()}
            />
            <button
              type="button"
              onClick={addClause}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add
            </button>
          </div>
          {clauses.length > 0 && (
            <ul className="mt-3 divide-y divide-gray-200">
              {clauses.map((clause, index) => (
                <li key={index} className="py-3 flex justify-between items-center">
                  <span className="text-sm text-gray-500">{clause}</span>
                  <button
                    type="button"
                    onClick={() => removeClause(index)}
                    className="ml-2 text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
