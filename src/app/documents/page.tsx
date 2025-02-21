'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import DocumentList from '@/components/documents/DocumentList'
import { 
  DocumentPlusIcon, 
  ArrowPathIcon,
  DocumentTextIcon,
  ShareIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default  function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkSession()
    loadDocuments()
  }, [])

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth')
    }
  }

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
          ),
          shares:document_shares(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const docsWithTags = data?.map(doc => ({
        ...doc,
        tags: doc.tags?.map((t:any) => t.tag) || []
      })) || []

      setDocuments(docsWithTags)
    } catch (err) {
      console.error('Error loading documents:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate statistics
  const totalDocuments = documents.length
  const sharedDocuments = documents.filter(doc => doc.shares.length > 0).length

  const recentDocuments = documents.filter(doc => {
    const docDate = new Date(doc.created_at)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return docDate >= thirtyDaysAgo
  }).length

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
            <div className="flex items-center gap-4">
              <button 
                onClick={loadDocuments}
                className="inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <ArrowPathIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                Refresh
              </button>
              <a
                href="/documents/new"
                className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <DocumentPlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                New Document
              </a>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">Total Documents</dt>
                      <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{totalDocuments}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ShareIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">Shared Documents</dt>
                      <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{sharedDocuments}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">Recent Documents</dt>
                      <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{recentDocuments}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 px-4 sm:px-6 lg:px-8">
        <DocumentList documents={documents} />
      </div>
    </div>
  )
}
