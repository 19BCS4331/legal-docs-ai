import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Document, Template } from '@/types'
import { DocumentsHeader } from '@/components/documents/DocumentsHeader'
import { DocumentSection } from '@/components/documents/DocumentSection'

type DocumentWithTemplate = Document & {
  template: Pick<Template, 'id' | 'name' | 'description'> | null;
  collaborators?: {
    role: string;
    user_id: string;
  }[];
  role?: string;
}

export default async function DocumentsPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  console.log('Current user ID:', user.id)

  // Get owned documents
  const { data: ownedDocs, error: ownedError } = await supabase
    .from('documents')
    .select('*, template:document_templates(id, name, description)')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (ownedError) {
    console.error('Error fetching owned documents:', ownedError)
  }

  // Get shared documents
  const { data: collaborations, error: collabError } = await supabase
    .from('document_collaborators')
    .select('document_id, role')
    .eq('user_id', user.id)

  if (collabError) {
    console.error('Error fetching collaborations:', collabError)
  }

  // Get the actual shared documents
  const sharedDocs: DocumentWithTemplate[] = []
  if (collaborations && collaborations.length > 0) {
    const { data: docs, error: sharedError } = await supabase
      .from('documents')
      .select('*, template:document_templates(id, name, description)')
      .in('id', collaborations.map(c => c.document_id))
      .order('updated_at', { ascending: false })

    if (sharedError) {
      console.error('Error fetching shared documents:', sharedError)
    } else if (docs) {
      // Map the roles back to the documents
      docs.forEach(doc => {
        const collab = collaborations.find(c => c.document_id === doc.id)
        if (collab) {
          sharedDocs.push({
            ...doc,
            role: collab.role
          })
        }
      })
    }
  }

  // For debugging
  console.log('Owned docs count:', ownedDocs?.length || 0)
  console.log('Shared docs count:', sharedDocs.length)
  console.log('Sample owned doc:', ownedDocs?.[0])
  console.log('Sample shared doc:', sharedDocs[0])

  return (
    <div className="min-h-screen bg-gray-50">
      <DocumentsHeader />

      {/* Main content */}
      <main className="py-8">
        <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          {/* Statistics */}
          <dl className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-white px-4 pb-12 pt-5 shadow-lg ring-1 ring-black/5 transition-all hover:shadow-xl sm:px-6 sm:pt-6">
              <dt>
                <div className="absolute rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 p-3 shadow-lg">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <p className="ml-16 truncate text-sm font-medium text-indigo-900/70">Total Documents</p>
              </dt>
              <dd className="ml-16 flex flex-col gap-1">
                <p className="text-3xl font-bold tracking-tight text-indigo-900">{(ownedDocs?.length || 0) + sharedDocs.length}</p>
                <p className="text-sm text-indigo-900/60">Documents in your workspace</p>
              </dd>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-white px-4 pb-12 pt-5 shadow-lg ring-1 ring-black/5 transition-all hover:shadow-xl sm:px-6 sm:pt-6">
              <dt>
                <div className="absolute rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 p-3 shadow-lg">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                  </svg>
                </div>
                <p className="ml-16 truncate text-sm font-medium text-blue-900/70">My Documents</p>
              </dt>
              <dd className="ml-16 flex flex-col gap-1">
                <p className="text-3xl font-bold tracking-tight text-blue-900">{ownedDocs?.length || 0}</p>
                <p className="text-sm text-blue-900/60">Documents you own</p>
              </dd>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-white px-4 pb-12 pt-5 shadow-lg ring-1 ring-black/5 transition-all hover:shadow-xl sm:px-6 sm:pt-6">
              <dt>
                <div className="absolute rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 p-3 shadow-lg">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>
                </div>
                <p className="ml-16 truncate text-sm font-medium text-purple-900/70">Shared with Me</p>
              </dt>
              <dd className="ml-16 flex flex-col gap-1">
                <p className="text-3xl font-bold tracking-tight text-purple-900">{sharedDocs.length}</p>
                <p className="text-sm text-purple-900/60">Documents shared by others</p>
              </dd>
            </div>
          </dl>

          <div className="space-y-8">
            {/* My Documents */}
            <DocumentSection
              title="My Documents"
              description="Documents you've created and own"
              documents={ownedDocs || []}
              userId={user.id}
            />

            {/* Shared Documents */}
            <DocumentSection
              title="Shared with Me"
              description="Documents others have shared with you"
              documents={sharedDocs}
              userId={user.id}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
