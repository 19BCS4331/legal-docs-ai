import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DocumentGenerator from '@/components/documents/DocumentGenerator'

export const metadata = {
  title: 'New Document - LegalDocs AI',
  description: 'Generate a new legal document using AI',
}

export default async function NewDocumentPage({ 
  searchParams 
}: { 
  searchParams: { template?: string } 
}) {
  const cookieStore = await cookies()
  const templateId = searchParams.template

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

  // Get user's subscription status
  const { data: subscription } = session ? await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('status', 'active')
    .order('subscription_end_date', { ascending: false })
    .limit(1)
    .single() : { data: null }

  // Get user's credits
  const { data: credits } = await supabase
    .from('credits')
    .select('amount')
    .eq('user_id', session.user.id)
    .single()

  // Get available templates
  const { data: templates } = await supabase
    .from('document_templates')
    .select('*')

  // Find the selected template if templateId is provided
  const selectedTemplate = templateId && templates ? 
    templates.find(template => template.id === templateId) : 
    null

  // Check if the user has access to the selected template
  if (selectedTemplate && 
      !selectedTemplate.available_in_plan.includes(subscription?.plan_type || 'free')) {
    // Redirect to upgrade page or show a message
    redirect('/dashboard/credits?error=template_access')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
              Create New Document
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Choose a template and fill in the required information to generate your document.
            </p>
          </div>

          {/* Document Generator */}
          <DocumentGenerator
            templates={templates || []}
            hasCredits={(credits?.amount || 0) > 0}
            credits={credits?.amount || 0}
            userId={session.user.id}
            userPlan={subscription?.plan_type}
            initialTemplateId={templateId}
          />
        </div>
      </div>
    </div>
  )
}
