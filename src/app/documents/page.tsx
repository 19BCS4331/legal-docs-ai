import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Document, Template, Tag } from '@/types'
import { DocumentsHeader } from '@/components/documents/DocumentsHeader'
import { DocumentSection } from '@/components/documents/DocumentSection'

type DocumentWithTemplate = Document & {
  template: Pick<Template, 'id' | 'name' | 'description'> | null;
  collaborators?: {
    role: string;
    user_id: string;
  }[];
  role?: string;
  tags?: Tag[];
  shareType?: 'collaboration' | 'shared';
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
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (ownedError) {
    console.error('Error fetching owned documents:', ownedError)
  }

  // Get templates for owned docs
  let ownedDocsWithTemplates = []
  if (ownedDocs?.length) {
    const { data: templates } = await supabase
      .from('document_templates')
      .select('id, name, description')
      .in('id', ownedDocs.map(d => d.template_id))

    // Get document tags
    const { data: documentTags, error: tagsError } = await supabase
      .from('document_tags')
      .select('document_id, tag_id, tags:tag_id(id, name, color, user_id)')
      .in('document_id', ownedDocs.map(d => d.id))
    
    if (tagsError) {
      console.error('Error fetching document tags:', tagsError)
    }

    // Group tags by document
    const tagsByDocument: Record<string, Tag[]> = {}
    documentTags?.forEach(dt => {
      if (!tagsByDocument[dt.document_id]) {
        tagsByDocument[dt.document_id] = []
      }
      if (dt.tags) {
        // Convert to Tag type
        const tag = dt.tags as unknown as Tag
        tagsByDocument[dt.document_id].push(tag)
      }
    })

    ownedDocsWithTemplates = ownedDocs.map(doc => ({
      ...doc,
      template: templates?.find(t => t.id === doc.template_id) || null,
      tags: tagsByDocument[doc.id] || []
    }))
  }

  // Get collaborations
  const { data: collaborations, error: collabError } = await supabase
    .from('document_collaborators')
    .select('document_id, role')
    .eq('user_id', user.id)

  if (collabError) {
    console.error('Error fetching collaborations:', collabError)
  }

  // Get document shares
  const { data: documentShares, error: sharesError } = await supabase
    .from('document_shares')
    .select('document_id, shared_by')
    .eq('shared_with', user.id)

  if (sharesError) {
    console.error('Error fetching document shares:', sharesError)
  }

  // Combine document IDs from both collaborations and shares
  const sharedDocIds = [
    ...(collaborations?.map(c => ({ id: c.document_id, type: 'collaboration' as const, role: c.role })) || []),
    ...(documentShares?.map(s => ({ id: s.document_id, type: 'shared' as const, sharedBy: s.shared_by })) || [])
  ];

  // Get shared documents
  let sharedDocs = []
  if (sharedDocIds.length > 0) {
    const { data: docs, error: sharedError } = await supabase
      .from('documents')
      .select('*')
      .in('id', sharedDocIds.map(d => d.id))
      .order('updated_at', { ascending: false })

    if (sharedError) {
      console.error('Error fetching shared documents:', sharedError)
    } else if (docs) {
      // Get templates for shared docs
      const { data: templates } = await supabase
        .from('document_templates')
        .select('id, name, description')
        .in('id', docs.map(d => d.template_id))

      // Get document tags for shared docs
      const { data: documentTags, error: tagsError } = await supabase
        .from('document_tags')
        .select('document_id, tag_id, tags:tag_id(id, name, color, user_id)')
        .in('document_id', docs.map(d => d.id))
      
      if (tagsError) {
        console.error('Error fetching document tags for shared docs:', tagsError)
      }

      // Group tags by document
      const tagsByDocument: Record<string, Tag[]> = {}
      documentTags?.forEach(dt => {
        if (!tagsByDocument[dt.document_id]) {
          tagsByDocument[dt.document_id] = []
        }
        if (dt.tags) {
          // Convert to Tag type
          const tag = dt.tags as unknown as Tag
          tagsByDocument[dt.document_id].push(tag)
        }
      })

      // Combine docs with templates, roles, and share type
      sharedDocs = docs.map(doc => {
        const sharedDocInfo = sharedDocIds.find(sd => sd.id === doc.id);
        return {
          ...doc,
          template: templates?.find(t => t.id === doc.template_id) || null,
          role: sharedDocInfo?.type === 'collaboration' ? sharedDocInfo.role : 'viewer',
          shareType: sharedDocInfo?.type,
          tags: tagsByDocument[doc.id] || []
        };
      });
    }
  }

  // Get all user tags for filtering
  const { data: userTags, error: userTagsError } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', user.id)
  
  if (userTagsError) {
    console.error('Error fetching user tags:', userTagsError)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <DocumentsHeader />

          {ownedDocsWithTemplates.length > 0 && (
            <DocumentSection
              title="Your Documents"
              description="Documents you've created"
              documents={ownedDocsWithTemplates}
              userId={user.id}
              availableTags={userTags || []}
            />
          )}

          {/* Shared Documents */}
          {sharedDocs.length > 0 && (
            <DocumentSection
              title="Shared With You"
              description="Documents others have shared with you"
              documents={sharedDocs}
              userId={user.id}
              availableTags={userTags || []}
            />
          )}

          {ownedDocsWithTemplates.length === 0 && sharedDocs.length === 0 && (
            <div className="rounded-xl bg-white p-8 shadow-lg text-center">
              <h3 className="text-lg font-semibold text-gray-900">No documents yet</h3>
              <p className="mt-2 text-gray-500">
                Create your first document to get started.
              </p>
              <div className="mt-6">
                <a
                  href="/documents/new"
                  className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Create Document
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
