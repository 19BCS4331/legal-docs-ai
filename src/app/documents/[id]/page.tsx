import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'
import DocumentViewer from '@/components/documents/DocumentViewer'
import { Document, Template } from '@/types'

interface PageProps {
  params: Promise<{ id: string }> | { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

type DocumentWithTemplate = Omit<Document, 'template'> & {
  template: Array<Pick<Template, 'id' | 'name' | 'description'>> | null
}

export default async function DocumentPage(props: PageProps) {
  const cookieStore = await cookies()
  const { id } = 'then' in props.params ? await props.params : props.params
  
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
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }
  
  const { data: subscription } = session ? await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', session.user.id)
  .eq('status', 'active')
  .order('subscription_end_date', { ascending: false })
  .limit(1)
  .single() : { data: null }



  console.log('Fetching document with ID:', id)

  

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log('No user found')
    notFound()
  }

  console.log('User ID:', user.id)

  const { data, error } = await supabase
    .from('documents')
    .select(`
      id,
      title,
      content,
      user_id,
      status,
      created_at,
      updated_at,
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
    .eq('id', id)
    .eq('user_id', user.id)
    .single() as { data: DocumentWithTemplate | null, error: any }

  if (error) {
    console.error('Error fetching document:', error)
    notFound()
  }

  if (!data) {
    console.log('No document found with ID:', id)
    notFound()
  }

  console.log('Document data:', JSON.stringify(data, null, 2))

  // Transform the document data to match our Document type
  const document: Document = {
    ...data,
    template: data.template && data.template.length > 0 ? {
      id: data.template[0].id,
      name: data.template[0].name,
      description: data.template[0].description
    } as Template : undefined
  }

  console.log('Transformed document:', JSON.stringify(document, null, 2))

  return (
    <div className="container mx-auto px-4 py-8">
      <DocumentViewer document={document} userPlan={subscription?.plan_type}/>
    </div>
  )
}
