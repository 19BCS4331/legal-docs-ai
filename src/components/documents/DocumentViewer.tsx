'use client'

import { useState, useEffect } from 'react'
import { Document, DocumentVersion } from '@/types'
import { DocumentTextIcon, PencilIcon, CheckIcon, XMarkIcon, ShareIcon, ArrowDownTrayIcon, TagIcon } from '@heroicons/react/24/outline'
import { marked } from 'marked'
import { format } from 'date-fns'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { DocumentVersionHistory } from './DocumentVersionHistory'
import { ShareDialog } from './ShareDialog'
import { ExportDialog } from './ExportDialog'
import { TagsDialog } from './TagsDialog'
import { useToast } from '../shared/Toast'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface DocumentViewerProps {
  document: Document
}

function getStatusColor(status: Document['status']) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700'
    case 'generated':
      return 'bg-blue-100 text-blue-700'
    case 'draft':
    default:
      return 'bg-yellow-100 text-yellow-700'
  }
}

export default function DocumentViewer({ document: initialDocument }: DocumentViewerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [document, setDocument] = useState(initialDocument)
  const [editContent, setEditContent] = useState(document.content)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [currentVersion, setCurrentVersion] = useState(1)
  const [isLoadingVersions, setIsLoadingVersions] = useState(true)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isTagsDialogOpen, setIsTagsDialogOpen] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    loadVersionHistory()
  }, [document.id])

  const loadVersionHistory = async () => {
    try {
      setIsLoadingVersions(true)
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', document.id)
        .order('version_number', { ascending: false })

      if (error) throw error

      setVersions(data || [])
      if (data && data.length > 0) {
        setCurrentVersion(data[0].version_number)
      }
    } catch (err) {
      console.error('Error loading version history:', err)
    } finally {
      setIsLoadingVersions(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)

      // Start a Supabase transaction
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .update({
          content: editContent,
          updated_at: new Date().toISOString(),
          status: document.status === 'draft' ? document.status : 'completed'
        })
        .eq('id', document.id)
        .select()
        .single()

      if (documentError) throw documentError

      // Create a new version
      const { data: versionData, error: versionError } = await supabase
        .from('document_versions')
        .insert({
          document_id: document.id,
          content: editContent,
          version_number: currentVersion + 1,
          created_by: document.user_id,
          created_at: new Date().toISOString(),
          change_summary: 'Updated document content' // You could make this customizable
        })
        .select()
        .single()

      if (versionError) throw versionError

      setDocument(documentData)
      await loadVersionHistory() // Reload versions
      setIsEditing(false)
      router.refresh()
      showToast('success', 'Document saved', 'Your changes have been saved successfully.')
    } catch (err) {
      console.error('Error saving document:', err)
      showToast('error', 'Error saving document', 'Your changes could not be saved. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditContent(document.content)
    setIsEditing(false)
    setError(null)
  }

  const handleRestoreVersion = async (version: DocumentVersion) => {
    try {
      setIsSaving(true)
      setError(null)

      // Update the document with the version's content
      const { data, error } = await supabase
        .from('documents')
        .update({
          content: version.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', document.id)
        .select()
        .single()

      if (error) throw error

      setDocument(data)
      setEditContent(data.content)
      setCurrentVersion(version.version_number)
      router.refresh()
    } catch (err) {
      console.error('Error restoring version:', err)
      setError('Failed to restore version. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const loadDocument = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', document.id)
        .single()

      if (error) throw error

      setDocument(data)
    } catch (err) {
      console.error('Error loading document:', err)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{document.title}</h2>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsShareDialogOpen(true)}
                    className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    <ShareIcon className="h-5 w-5 mr-2 text-gray-400" aria-hidden="true" />
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExportDialogOpen(true)}
                    className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-gray-400" aria-hidden="true" />
                    Export
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTagsDialogOpen(true)}
                    className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    <TagIcon className="h-5 w-5 mr-2 text-gray-400" aria-hidden="true" />
                    Tags
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isEditing ? (
            <div className="mt-8">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[500px] p-4 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter your document content..."
              />
              <div className="mt-2 text-sm text-gray-500">
                Use Markdown for formatting. Preview will be shown after saving.
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
              <div className="px-4 py-6 sm:p-8">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className="prose prose-slate prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-a:text-blue-600 hover:prose-a:text-blue-500"
                  >
                    {document.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {!isEditing && !isLoadingVersions && (
            <DocumentVersionHistory
              versions={versions}
              currentVersion={currentVersion}
              onRestoreVersion={handleRestoreVersion}
            />
          )}
        </div>
      </div>

      <ShareDialog
        isOpen={isShareDialogOpen}
        document={document}
        onClose={() => setIsShareDialogOpen(false)}
      />

      {isExportDialogOpen && (
        <ExportDialog
          isOpen={isExportDialogOpen}
          setIsOpen={setIsExportDialogOpen}
          documentData={document}
        />
      )}

      <TagsDialog
        isOpen={isTagsDialogOpen}
        documentId={document.id}
        onClose={() => setIsTagsDialogOpen(false)}
        onTagsChange={loadDocument}
      />
    </div>
  )
}
