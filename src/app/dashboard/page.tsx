import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DocumentStats } from '@/components/dashboard/DocumentStats'
import Link from 'next/link'
import { CreditBalance } from '@/components/dashboard/CreditBalance'
import { Document, Template } from '@/types'

type DocumentWithTemplate = Omit<Document, 'template'> & {
  template: Pick<Template, 'id' | 'name' | 'description'> | null
}

export default async function DashboardPage() {
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

  const { data: documents } = await supabase
    .from('documents')
    .select(`
      id,
      title,
      content,
      user_id,
      template_id,
      input_data,
      status,
      created_at,
      updated_at,
      template:document_templates!template_id (
        id,
        name,
        description
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5) as { data: DocumentWithTemplate[] | null }

  // Get document counts by status
  const { data: documentsByStatus } = await supabase
    .from('documents')
    .select('status')
    .eq('user_id', user.id)

  const stats = {
    total: documentsByStatus?.length || 0,
    draft: documentsByStatus?.filter(d => d.status === 'draft').length || 0,
    generated: documentsByStatus?.filter(d => d.status === 'generated').length || 0,
    completed: documentsByStatus?.filter(d => d.status === 'completed').length || 0
  }

  const { data: credits } = await supabase
    .from('credits')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <div className="mt-8">
        <DocumentStats stats={stats} />
      </div>

      <div className="mt-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h2 className="text-xl font-semibold text-gray-900">Recent Documents</h2>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              href="/documents/new"
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Create Document
            </Link>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Title
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Template
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {(documents || []).map((document) => (
                      <tr key={document.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          <Link href={`/documents/${document.id}`} className="text-indigo-600 hover:text-indigo-900">
                            {document.title}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {document.template?.name || 'Custom Document'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            document.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : document.status === 'generated'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(document.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Dashboard - LegalDocs AI',
  description: 'View your recent documents and account status',
}
