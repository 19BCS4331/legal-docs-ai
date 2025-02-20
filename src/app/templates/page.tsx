import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { TemplateList } from '@/components/templates/TemplateList'
import { TemplateFilters } from '@/components/templates/TemplateFilters'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'

export const metadata = {
  title: 'Templates - LegalDocs AI',
  description: 'Browse and manage document templates',
}

export default async function TemplatesPage() {
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
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }

  // Get user role
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .single()

  const isAdmin = userRole?.role === 'admin'

  // Get user's subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_type, status')
    .eq('user_id', session.user.id)
    .single()

  // Get all templates and filter on client side for better UX
  const { data: templates } = await supabase
    .from('document_templates')
    .select('*')
    .order('category')
    .order('name')

  // Get templates usage statistics using count aggregation
  const { data: templateStats } = await supabase.rpc('get_template_usage_stats', {
    user_id: session.user.id
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
                Document Templates
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Browse our collection of legal document templates or create your own custom template.
              </p>
            </div>

            {isAdmin && (
              <Link
                href="/templates/new"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Create Template
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Filters */}
            <div className="lg:col-span-1">
              <TemplateFilters subscription={subscription} />
            </div>

            {/* Template List */}
            <div className="lg:col-span-3">
              <TemplateList
                templates={templates || []}
                templateStats={templateStats || []}
                userPlan={subscription?.plan_type || 'free'}
                isAdmin={isAdmin}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
