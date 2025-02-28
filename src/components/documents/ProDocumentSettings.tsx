'use client'

import { useState } from 'react'
import { Switch } from '@headlessui/react'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface ProDocumentSettingsProps {
  onToneChange: (tone: 'formal' | 'simple' | 'industry-specific') => void
  onClausesChange: (clauses: string[]) => void
  defaultTone?: 'formal' | 'simple' | 'industry-specific'
  defaultClauses?: string[]
}

export function ProDocumentSettings({
  onToneChange,
  onClausesChange,
  defaultTone = 'formal',
  defaultClauses = [],
}: ProDocumentSettingsProps) {
  const [selectedTone, setSelectedTone] = useState(defaultTone)
  const [clauses, setClauses] = useState(defaultClauses)
  const [newClause, setNewClause] = useState('')

  const handleToneChange = (tone: 'formal' | 'simple' | 'industry-specific') => {
    setSelectedTone(tone)
    onToneChange(tone)
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

      {/* Writing Tone Selection */}
      <div>
        <label className="text-sm font-medium text-gray-700">Writing Tone</label>
        <div className="mt-2 space-y-2">
          {['formal', 'simple', 'industry-specific'].map((tone) => (
            <div key={tone} className="flex items-center">
              <input
                type="radio"
                name="tone"
                value={tone}
                checked={selectedTone === tone}
                onChange={() => handleToneChange(tone as any)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="ml-3 block text-sm font-medium text-gray-700 capitalize">
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
              placeholder="Enter clause description"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={addClause}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {clauses.map((clause, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
              >
                <span className="text-sm text-gray-700">{clause}</span>
                <button
                  type="button"
                  onClick={() => removeClause(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
