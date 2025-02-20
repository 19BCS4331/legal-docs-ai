'use client'

import { useState, useEffect } from 'react'
import { Document, Tag } from '@/types'
import { FunnelIcon, TagIcon } from '@heroicons/react/24/outline'
import { createBrowserClient } from '@supabase/ssr'
import { useToast } from '../shared/Toast'

interface DocumentSearchProps {
  onSearch: (query: string) => void
  onFilter: (status: Document['status'] | 'all') => void
  onSort: (options: { field: 'title' | 'created_at' | 'updated_at'; direction: 'asc' | 'desc' }) => void
  onTagsChange: (tagIds: string[]) => void
}

export function DocumentSearch({ onSearch, onFilter, onSort, onTagsChange }: DocumentSearchProps) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<Document['status'] | 'all'>('all')
  const [sortField, setSortField] = useState<'title' | 'created_at' | 'updated_at'>('updated_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name')

      if (error) throw error

      setAvailableTags(data || [])
    } catch (err) {
      console.error('Error loading tags:', err)
      showToast('error', 'Error loading tags', 'Failed to load tags. Please try again.')
    }
  }

  const handleQueryChange = (value: string) => {
    setQuery(value)
    onSearch(value)
  }

  const handleStatusChange = (value: Document['status'] | 'all') => {
    setStatus(value)
    onFilter(value)
  }

  const handleSortChange = (field: 'title' | 'created_at' | 'updated_at') => {
    const direction = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortField(field)
    setSortDirection(direction)
    onSort({ field, direction })
  }

  const toggleTag = (tagId: string) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId]
    setSelectedTags(newTags)
    onTagsChange(newTags)
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Search documents
          </label>
          <input
            type="search"
            name="search"
            id="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Search documents..."
          />
        </div>

        <div className="flex items-center gap-4">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as Document['status'] | 'all')}
            className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="generated">Generated</option>
            <option value="completed">Completed</option>
          </select>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSortChange('title')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                sortField === 'title'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Title {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              type="button"
              onClick={() => handleSortChange('updated_at')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                sortField === 'updated_at'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Updated {sortField === 'updated_at' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              type="button"
              onClick={() => handleSortChange('created_at')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                sortField === 'created_at'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Created {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag.id)}
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
              selectedTags.includes(tag.id)
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-700'
            } hover:bg-gray-200`}
            style={{
              backgroundColor: selectedTags.includes(tag.id) ? tag.color + '33' : undefined,
              color: selectedTags.includes(tag.id) ? tag.color : undefined,
            }}
          >
            <TagIcon className="h-4 w-4 mr-1" />
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  )
}
