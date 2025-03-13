'use client'

import { useState, useEffect } from 'react'
import { Document, DocumentVersion } from '@/types'
import { DocumentTextIcon, PencilIcon, CheckIcon, XMarkIcon, ShareIcon, ArrowDownTrayIcon, TagIcon, UserGroupIcon } from '@heroicons/react/24/outline'
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
import { DocumentAnalysis } from './DocumentAnalysis'
import { DocumentSignature } from './DocumentSignature'
import { CollaboratorDialog } from './CollaboratorDialog'
import { ActiveUsersIndicator } from './ActiveUsersIndicator'
import { useDocumentCollaboration } from '@/hooks/useDocumentCollaboration'
import CommentsPanel from './CommentsPanel'
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getMemoizedContent, saveMemoizedContent } from '@/utils/aiMemoization'

interface DocumentViewerProps {
  document: Document
  userPlan?: 'free' | 'pro' | 'enterprise'
  userRole: string
  userId: string
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

function canEditDocument(role: string) {
  return ['owner', 'editor'].includes(role.toLowerCase())
}

function canComment(role: string) {
  return ['owner', 'editor', 'commenter'].includes(role.toLowerCase())
}

export default function DocumentViewer({ document: initialDocument, userPlan = 'free', userRole, userId }: DocumentViewerProps) {
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
  const [isCollaboratorDialogOpen, setIsCollaboratorDialogOpen] = useState(false)

  // New states for analysis features
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [risks, setRisks] = useState<{ severity: 'high' | 'medium' | 'low'; description: string; suggestion: string }[]>([])
  const [summary, setSummary] = useState<string | null>(null)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [isProUser] = useState(userPlan === 'pro' || userPlan === 'enterprise')
  const [signatures, setSignatures] = useState<{ [key: string]: string }>(document.signatures || {})
  const [jurisdiction, setJurisdiction] = useState(document.metadata?.jurisdiction || '')

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

  // Load document data on mount
  useEffect(() => {
    const loadDocument = async () => {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('id', document.id)
          .single()

        if (error) throw error

        if (data) {
          setEditContent(data.content || '')
          setSignatures(data.signatures || {})
          if (data.metadata?.jurisdiction) {
            setJurisdiction(data.metadata.jurisdiction)
          }
        }
      } catch (error) {
        console.error('Error loading document:', error)
        showToast('error', 'Error loading document', 'Failed to load document data.')
      }
    }

    loadDocument()
  }, [document.id])

  const handleSave = async () => {
    if (!canEditDocument(userRole)) {
      showToast('error', 'Permission denied', 'You do not have permission to edit this document.')
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      // Start a Supabase transaction
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .update({
          content: editContent,
          signatures,
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
    if (!canEditDocument(userRole)) {
      setError('Permission denied')
      return
    }

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
      setError('Error restoring version')
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

  const analyzeRisks = async () => {
    setIsAnalyzing(true)
    setError(null)
    
    try {
      // Select model based on user plan
      const model = isProUser ? 'gemini-2.0-flash' : 'gemini-1.5-flash'

      const prompt = `You are a legal risk analysis expert. Analyze the given legal document and identify potential risks, ambiguities, or areas that need improvement.

Document to analyze:
${document.content}

Provide your analysis in the following JSON format:
[
  {
    "severity": "high|medium|low",
    "description": "Clear description of the risk",
    "suggestion": "Specific suggestion to address the risk"
  }
]

Ensure that:
1. Each risk has a severity level (high/medium/low)
2. Each description clearly explains the potential issue
3. Each suggestion provides specific, actionable improvements
4. The response is valid JSON that can be parsed`

      // Check for memoized content first
      const memoizedContent = await getMemoizedContent(prompt, model, 'risk_analysis', document.id)

      if (memoizedContent) {
        console.log('Using memoized risk analysis')
        const risksData = JSON.parse(memoizedContent)
        if (Array.isArray(risksData) && risksData.length > 0) {
          setRisks(risksData)
          return
        }
      }

      // If no valid memoized content, generate new analysis
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)
      const geminiModel = genAI.getGenerativeModel({ model })
      const result = await geminiModel.generateContent(prompt)
      const content = result.response.text()

      console.log('Generated new risk analysis')

      // Remove markdown code block syntax if present
      const jsonStr = content.replace(/```json\n|\n```/g, '').trim()
      console.log('Cleaned JSON string:', jsonStr)
      
      // Parse the cleaned JSON string
      const risksData = JSON.parse(jsonStr)
      console.log('Parsed risks data:', risksData)
      
      if (Array.isArray(risksData) && risksData.length > 0) {
        setRisks(risksData)
        // Save the result for future use
        await saveMemoizedContent(jsonStr, prompt, model, 'risk_analysis', document.id)
      } else {
        throw new Error('Invalid risks data format')
      }
    } catch (error) {
      console.error('Error analyzing risks:', error)
      setError('Failed to analyze risks. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateSummary = async () => {
    setIsGeneratingSummary(true)
    setError(null)
    
    try {
      // Select model based on user plan
      const model = isProUser ? 'gemini-2.0-flash' : 'gemini-1.5-flash'

      const prompt = `You are an expert at simplifying legal documents. Create a clear, concise summary of the following legal document using proper markdown formatting. Focus on the key points and obligations while avoiding legal jargon.

Document to summarize:
${document.content}

Format your response using this markdown structure:
# Document Summary

## Key Information
- Type of Document
- Parties Involved
- Date and Duration

## Main Purpose
[Brief explanation of the document's primary purpose]

## Key Terms and Conditions
- [Important point 1]
- [Important point 2]
- [etc.]

## Obligations and Responsibilities
### Party A (First Party)
- [Obligation 1]
- [Obligation 2]

### Party B (Second Party)
- [Obligation 1]
- [Obligation 2]

## Important Dates and Deadlines
- [List any critical dates]

## Additional Notes
[Any other important information]`

      // Check for memoized content first
      const memoizedContent = await getMemoizedContent(prompt, model, 'summary', document.id)

      if (memoizedContent) {
        console.log('Using memoized summary')
        setSummary(memoizedContent)
        return
      }

      // If no valid memoized content, generate new summary
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)
      const geminiModel = genAI.getGenerativeModel({ model })
      const result = await geminiModel.generateContent(prompt)
      const content = result.response.text()

      console.log('Generated new summary')
      console.log('Full summary response:', content)

      setSummary(content)
      // Save the result for future use
      await saveMemoizedContent(content, prompt, model, 'summary', document.id)
    } catch (error) {
      console.error('Error generating summary:', error)
      setError('Failed to generate summary. Please try again.')
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  const handleSignatureAdd = async (signature: string, position: string) => {
    try {
      // Update signatures in the document
      const updatedSignatures = { ...signatures, [position]: signature }
      setSignatures(updatedSignatures)

      // Save to database
      const { error } = await supabase
        .from('documents')
        .update({ signatures: updatedSignatures })
        .eq('id', document.id)

      if (error) throw error

     
      showToast('success', 'Signature added successfully', 'Your changes have been saved successfully.')
    } catch (error) {
      console.error('Error adding signature:', error)
      showToast('error', 'error adding signature', 'Failed to save changes.')
    }
  }

  const router = useRouter()
  const { showToast } = useToast()

  const renderContent = () => {
    return (
      <div className="prose max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {editContent}
        </ReactMarkdown>

        {/* Signatures section */}
        {Object.keys(signatures).length > 0 && (
          <div className="mt-8 border-t pt-8">
            <h2 className="text-2xl font-bold mb-6">Signatures</h2>
            
            {/* Creator signature */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Document Creator</h3>
              {signatures.creator ? (
                <img 
                  src={signatures.creator} 
                  alt="Creator Signature" 
                  className="max-h-20 object-contain border-b border-gray-200 pb-2"
                />
              ) : (
                <p className="text-gray-500 italic">Signature Required</p>
              )}
            </div>

            {/* Signer signature */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Document Signer</h3>
              {signatures.signer ? (
                <img 
                  src={signatures.signer} 
                  alt="Signer Signature" 
                  className="max-h-20 object-contain border-b border-gray-200 pb-2"
                />
              ) : (
                <p className="text-gray-500 italic">Signature Required</p>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Track cursor position for collaboration
  const handleMouseCursorChange = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (userPlan !== 'enterprise') return
    const textarea = e.currentTarget
    updateCursorPosition(textarea.selectionStart)
  }

  const handleKeyboardCursorChange = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (userPlan !== 'enterprise') return
    const textarea = e.currentTarget
    updateCursorPosition(textarea.selectionStart)
  }

  // Initialize collaboration hook
  const {
    collaborators,
    comments,
    activeUsers,
    updateCursorPosition,
    addComment,
    updateComment,
    resolveComment,
    deleteComment,
    addCollaborator,
    removeCollaborator
  } = useDocumentCollaboration(document.id, userId)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col items-start justify-between mb-4">
            <div className="flex flex-col sm:flex-row items-start gap-2 mt-4 w-full sm:w-auto">
              {!isEditing ? (
                <>
                  {canEditDocument(userRole) && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center justify-center w-full sm:w-auto rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      <PencilIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                      Edit
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsShareDialogOpen(true)}
                    className="inline-flex items-center justify-center w-full sm:w-auto rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    <ShareIcon className="h-5 w-5 mr-2 text-gray-400" aria-hidden="true" />
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExportDialogOpen(true)}
                    className="inline-flex items-center justify-center w-full sm:w-auto rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-gray-400" aria-hidden="true" />
                    Export
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTagsDialogOpen(true)}
                    className="inline-flex items-center justify-center w-full sm:w-auto rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    <TagIcon className="h-5 w-5 mr-2 text-gray-400" aria-hidden="true" />
                    Tags
                  </button>
                  {userPlan === 'enterprise' && (
                    <button
                      type="button"
                      onClick={() => setIsCollaboratorDialogOpen(true)}
                      className="inline-flex items-center justify-center w-full sm:w-auto rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      <UserGroupIcon className="h-5 w-5 mr-2 text-gray-400" aria-hidden="true" />
                      Collaborators
                    </button>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center w-full sm:w-auto rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center w-full sm:w-auto rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <h2 className="text-lg font-semibold text-gray-900 text-left mt-4"> Document Title: {document.title}</h2>
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

          {/* Main content area with document and comments */}
          <div className="mt-6 flex flex-col lg:flex-row gap-8">
            {/* Document content */}
            <div className="flex-1">
              <div className="rounded-md border border-gray-200">
                {isEditing ? (
                  <textarea
                    rows={20}
                    className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onMouseUp={handleMouseCursorChange}
                    onKeyUp={handleKeyboardCursorChange}
                  />
                ) : (
                  <div className="prose max-w-none p-4">
                    {renderContent()}
                  </div>
                )}
              </div>

              
            </div>

            {/* Comments panel */}
            <div className="lg:w-96">
              <CommentsPanel
                comments={comments}
                onAddComment={addComment}
                onUpdateComment={updateComment}
                onResolveComment={resolveComment}
                onDeleteComment={deleteComment}
                userPlan={userPlan}
                canComment={canComment(userRole)}
                userId={userId}
              />
            </div>
          </div>

          {/* Collaboration section */}
          {userPlan === 'enterprise' && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsCollaboratorDialogOpen(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  Manage Collaborators
                </button>
                {activeUsers && activeUsers.length > 0 && (
                  <ActiveUsersIndicator users={activeUsers} />
                )}
              </div>
            </div>
          )}

          {/* Document Analysis for Pro Users */}
          {isProUser && (
            <div className="mt-6">
              <DocumentAnalysis
                documentContent={document.content}
                onAnalyze={analyzeRisks}
                isAnalyzing={isAnalyzing}
                risks={risks}
                summary={summary}
                isGeneratingSummary={isGeneratingSummary}
                onGenerateSummary={generateSummary}
              />
            </div>
          )}

          {/* Document Signatures for Pro Users */}
          {isProUser && (
            <div className="mt-6">
              <DocumentSignature
                onSignatureAdd={handleSignatureAdd}
                signatures={signatures}
                userRole="creator"
              />
            </div>
          )}

          {/* Active Users Indicator for Enterprise Users */}
          {userPlan === 'enterprise' && (
            <div className="mt-6">
              {activeUsers && activeUsers.length > 0 && (
                <ActiveUsersIndicator users={activeUsers} />
              )}
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

      <CollaboratorDialog
        isOpen={isCollaboratorDialogOpen}
        onClose={() => setIsCollaboratorDialogOpen(false)}
        collaborators={collaborators}
        onAddCollaborator={addCollaborator}
        onRemoveCollaborator={removeCollaborator}
        isEnterpriseUser={userPlan === 'enterprise'}
        userId={userId}
      />
    </div>
  )
}
