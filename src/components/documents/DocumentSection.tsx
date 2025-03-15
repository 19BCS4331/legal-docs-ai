'use client'

import { useState } from 'react'
import { DocumentList } from './DocumentList'
import { DocumentFilters, SortOption, StatusFilter } from './DocumentFilters'
import { Document, Tag } from '@/types'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import debounce from 'lodash/debounce'

type DocumentSectionProps = {
  title: string
  description: string
  documents: Document[]
  userId: string
  availableTags: Tag[]
}

function sortDocuments(docs: Document[], sort: SortOption) {
  return [...docs].sort((a, b) => {
    switch (sort) {
      case 'updated_desc':
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      case 'updated_asc':
        return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
      case 'name_asc':
        return (a.title || '').localeCompare(b.title || '')
      case 'name_desc':
        return (b.title || '').localeCompare(a.title || '')
      default:
        return 0
    }
  })
}

function filterDocuments(docs: Document[], status: StatusFilter, search: string, selectedTags: string[]) {
  return docs.filter(doc => {
    const matchesStatus = status === 'all' || doc.status === status
    const matchesSearch = search === '' || 
      doc.title?.toLowerCase().includes(search.toLowerCase()) ||
      doc.template?.name?.toLowerCase().includes(search.toLowerCase())
    
    // Filter by tags if any are selected
    const matchesTags = selectedTags.length === 0 || 
      (doc.tags && doc.tags.some(tag => selectedTags.includes(tag.id)))
    
    return matchesStatus && matchesSearch && matchesTags
  })
}

export function DocumentSection({ title, description, documents, userId, availableTags }: DocumentSectionProps) {
  const [currentSort, setCurrentSort] = useState<SortOption>('updated_desc')
  const [currentStatus, setCurrentStatus] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const sortedDocs = sortDocuments(documents, currentSort)
  const filteredDocs = filterDocuments(sortedDocs, currentStatus, searchQuery, selectedTags)

  const debouncedSearch = debounce((value: string) => {
    setSearchQuery(value)
  }, 300)

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    )
  }

  return (
    <div className="rounded-xl bg-white shadow-lg ring-1 ring-black/5">
      <div className="border-b border-gray-200/80 px-4 py-5 sm:px-6">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900">{title}</h2>
            <p className="mt-1 mb-2 text-sm text-gray-500">{description}</p>
          </div>
          <DocumentFilters
            currentSort={currentSort}
            currentStatus={currentStatus}
            onSortChange={setCurrentSort}
            onStatusChange={setCurrentStatus}
          />
        </div>
        <div className="relative mt-4 sm:mt-0">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="search"
            placeholder="Search documents..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300/50 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow bg-gray-50/50"
          />
        </div>
        
        {/* Tag filters */}
        {availableTags.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Filter by tags:</div>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.id)}
                  className={`
                    inline-flex items-center rounded-full px-3 py-1 text-xs font-medium
                    ${selectedTags.includes(tag.id) 
                      ? 'ring-2 ring-offset-1' 
                      : 'opacity-70 hover:opacity-100'}
                    transition-all
                  `}
                  style={{ 
                    backgroundColor: `${tag.color}20`, // Add transparency
                    color: tag.color,
                    borderColor: tag.color
                  }}
                >
                  {tag.name}
                  {selectedTags.includes(tag.id) && (
                    <span className="ml-1 text-xs">×</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="bg-gradient-to-b from-gray-50/50 to-white px-4 py-6 sm:px-6">
        <DocumentList documents={filteredDocs} userId={userId} />
      </div>
    </div>
  )
}
