import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { TemplateEditor } from '@/components/templates/TemplateEditor'

export const metadata = {
  title: 'Create Template - LegalDocs AI',
  description: 'Create a new document template',
}

export default async function NewTemplatePage() {
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

  // Check if user has admin privileges
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .single()

  if (userRole?.role !== 'admin') {
    redirect('/templates')
  }

  // Get existing categories for the dropdown
  const { data: categories } = await supabase
    .from('document_templates')
    .select('category')
    .not('category', 'is', null)

  // Get unique categories
  const uniqueCategories = Array.from(new Set(categories?.map((t) => t.category) || []))

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
              Create New Template
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Design a new document template with custom fields and AI prompt.
            </p>
          </div>

          {/* Template Editor */}
          <TemplateEditor
            existingCategories={uniqueCategories}
            userId={session.user.id}
          />
        </div>
      </div>
    </div>
  )
}
