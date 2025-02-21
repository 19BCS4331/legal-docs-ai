'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Document } from '@/types'
import { createBrowserClient } from '@supabase/ssr'
import { 
  DocumentTextIcon, 
  TrashIcon,
  PencilIcon,
  ShareIcon,
  EyeIcon,
  ChevronUpDownIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { useToast } from '../shared/Toast'
import { DocumentSearch } from './DocumentSearch'
import { ConfirmDialog } from '../shared/ConfirmDialog'
import { useRouter } from 'next/navigation'

interface DocumentListProps {
  documents: Document[]
}

export default function DocumentList({ documents: initialDocuments }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<Document['status'] | 'all'>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortField, setSortField] = useState<'title' | 'created_at' | 'updated_at'>('updated_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [isDeleting, setIsDeleting] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)
  const { showToast } = useToast()
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentToDelete?.id)

      if (error) throw error

      setDocuments(documents.filter(doc => doc.id !== documentToDelete?.id))
    } catch (err) {
      console.error('Error loading documents:', err)
      showToast('error', 'Error loading documents', 'Failed to load documents. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent, document: Document) => {
    e.preventDefault()
    e.stopPropagation()
    setDocumentToDelete(document)
  }

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return

    try {
      setIsDeleting(true)
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentToDelete.id)

      if (error) throw error

      setDocuments(documents.filter(doc => doc.id !== documentToDelete.id))
      showToast('success', 'Document deleted', `"${documentToDelete.title}" has been deleted successfully.`)
      router.refresh()
    } catch (err) {
      console.error('Error deleting document:', err)
      showToast('error', 'Error deleting document', 'The document could not be deleted. Please try again.')
    } finally {
      setIsDeleting(false)
      setDocumentToDelete(null)
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tagId => doc.tags?.some(tag => tag.id === tagId))
    return matchesSearch && matchesStatus && matchesTags
  }).sort((a, b) => {
    if (sortField === 'title') {
      return sortDirection === 'asc'
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title)
    }
    return sortDirection === 'asc'
      ? new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime()
      : new Date(b[sortField]).getTime() - new Date(a[sortField]).getTime()
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                <div className="mt-2 h-3 w-1/2 bg-gray-100 rounded"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">No documents</h3>
        <p className="mt-2 text-sm text-gray-500">Get started by creating a new document.</p>
        <div className="mt-6">
          <Link
            href="/documents/new"
            className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <DocumentTextIcon className="-ml-0.5 h-5 w-5" />
            Create Document
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DocumentSearch
        onSearch={setSearchQuery}
        onFilter={setStatusFilter}
        onSort={({ field, direction }) => {
          setSortField(field)
          setSortDirection(direction)
        }}
        onTagsChange={setSelectedTags}
      />

      <div className="overflow-hidden p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((document) => (
            <div
              key={document.id}
              className="group relative bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 hover:shadow-md transition-all duration-150 ease-in-out"
            >
              <div className="p-6">
                <div className="flex items-center gap-x-3">
                  <div className={`rounded-lg p-2 ${
                    document.status === 'completed'
                      ? 'bg-green-50'
                      : document.status === 'generated'
                      ? 'bg-blue-50'
                      : 'bg-yellow-50'
                  }`}>
                    <DocumentTextIcon className={`h-5 w-5 ${
                      document.status === 'completed'
                        ? 'text-green-600'
                        : document.status === 'generated'
                        ? 'text-blue-600'
                        : 'text-yellow-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/documents/${document.id}`} className="focus:outline-none">
                      <h3 className="text-base font-semibold leading-6 text-gray-900 hover:text-indigo-600 truncate">
                        {document.title}
                      </h3>
                    </Link>
                    <p className="mt-1 text-sm text-gray-500 truncate">
                      {document.template?.name || 'No template'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteClick(e, document)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-1 text-gray-400 hover:text-red-500"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-3 text-sm text-gray-500 line-clamp-2">
                  {document.content}
                </div>

                {document.tags && document.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {document.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: `${tag.color}15`,
                          color: tag.color,
                        }}
                      >
                        <span
                          className="mr-1 h-1 w-1 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-x-2">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium capitalize ${
                      document.status === 'completed'
                        ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                        : document.status === 'generated'
                        ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                        : 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'
                    }`}>
                      {document.status}
                    </span>
                    <time dateTime={document.updated_at} className="text-xs text-gray-500">
                      {format(new Date(document.updated_at), 'MMM d, yyyy')}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!documentToDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${documentToDelete?.title}"? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDocumentToDelete(null)}
        isDestructive={true}
      />
    </div>
  )
}
