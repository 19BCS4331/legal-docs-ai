import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DocumentViewer from '../../../../components/documents/DocumentViewer'

export default async function SharedDocumentPage({
  params,
}: {
  params: { id: string }
}) {
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

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Check if the user has access to this document
  const { data: documentShare, error: shareError } = await supabase
    .from('document_shares')
    .select('document_id')
    .eq('document_id', params.id)
    .eq('shared_with', session.user.id)
    .single()

  if (shareError || !documentShare) {
    redirect('/documents')
  }

  // Get the document
  const { data: document, error: documentError } = await supabase
    .from('documents')
    .select(`
      *,
      template:document_templates(*),
      tags:document_tags(
        tag:tags(
          id,
          name,
          color,
          created_at,
          user_id
        )
      )
    `)
    .eq('id', params.id)
    .single()

  if (documentError || !document) {
    redirect('/documents')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <DocumentViewer document={document} />
      </div>
    </div>
  )
}
