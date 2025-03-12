import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DocumentStats } from '@/components/dashboard/DocumentStats'
import { CreditBalance } from '@/components/dashboard/CreditBalance'
import { WelcomeCard } from '@/components/dashboard/WelcomeCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecentDocuments } from '@/components/dashboard/RecentDocuments'
import { Document, Template } from '@/types'

type DocumentWithTemplate = Document & {
  template: Pick<Template, 'id' | 'name' | 'description'> | null
}

export const metadata = {
  title: 'Dashboard - LegalDocs AI',
  description: 'View your recent documents and account status',
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
      template:document_templates (
        id,
        name,
        description
      )
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false }) as { data: DocumentWithTemplate[] | null }

  const { data: credits } = await supabase
    .from('credits')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('subscription_end_date', { ascending: false })
    .limit(1)
    .single()

  const stats = {
    total: documents?.length || 0,
    draft: documents?.filter((doc) => doc.status === 'draft').length || 0,
    generated: documents?.filter((doc) => doc.status === 'generated').length || 0,
    completed: documents?.filter((doc) => doc.status === 'completed').length || 0,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <WelcomeCard user={user} />

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Quick Actions</h2>
          <QuickActions />
        </div>

        {/* Stats and Credit Balance */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DocumentStats stats={stats} />
          </div>
          <div className="lg:col-span-1">
            <CreditBalance credits={credits} subscription={subscription} />
          </div>
        </div>

        {/* Recent Documents */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Recent Activity</h2>
          <RecentDocuments documents={documents || []} />
        </div>
      </div>
    </div>
  )
}
