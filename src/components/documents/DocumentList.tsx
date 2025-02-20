'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Document } from '@/types'
import { createBrowserClient } from '@supabase/ssr'
import { DocumentTextIcon, TrashIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { useToast } from '../shared/Toast'
import { DocumentSearch } from './DocumentSearch'
import { ConfirmDialog } from '../shared/ConfirmDialog'
import { useRouter } from 'next/navigation'

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          template:document_templates(*),
          tags:document_tags(
            tag:tags(
              id,
              name,
              color
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the nested tags structure
      const docsWithTags = data?.map(doc => ({
        ...doc,
        tags: doc.tags?.map((t:any) => t.tag) || []
      })) || []

      setDocuments(docsWithTags)
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

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-12">
        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new document.</p>
        <div className="mt-6">
          <Link
            href="/documents/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Create Document
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <DocumentSearch
        onSearch={setSearchQuery}
        onFilter={setStatusFilter}
        onSort={({ field, direction }) => {
          setSortField(field)
          setSortDirection(direction)
        }}
        onTagsChange={setSelectedTags}
      />

      {isLoading ? (
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((document) => (
            <Link
              key={document.id}
              href={`/documents/${document.id}`}
              className="group block"
            >
              <div className="relative flex flex-col h-full overflow-hidden rounded-lg border border-gray-300 bg-white p-4 hover:border-gray-400 hover:shadow-sm transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
                    {document.title}
                  </h3>
                  <button
                    onClick={(e) => handleDeleteClick(e, document)}
                    className="hidden group-hover:inline-flex ml-auto items-center rounded-md bg-white p-1 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {document.content}
                </p>

                <div className="mt-auto">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {document.tags?.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: tag.color + '33',
                          color: tag.color
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      document.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : document.status === 'generated'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                    </span>
                    <time dateTime={document.created_at}>
                      {format(new Date(document.created_at), 'MMM d, yyyy')}
                    </time>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No documents found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

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
