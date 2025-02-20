import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import DocumentGenerator from '@/components/documents/DocumentGenerator'

export default async function NewDocumentPage() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name)
          return cookie?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            console.error('Error setting cookie:', error)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({ name, ...options })
          } catch (error) {
            console.error('Error removing cookie:', error)
          }
        },
      },
    }
  )

  // Get user's subscription status
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return {
      redirect: {
        destination: '/auth',
        permanent: false,
      },
    }
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_type, status')
    .eq('user_id', session.user.id)
    .single()

  const { data: credits } = await supabase
    .from('credits')
    .select('amount')
    .eq('user_id', session.user.id)
    .single()

  // Get available templates based on user's plan
  const { data: templates } = await supabase
    .from('document_templates')
    .select('*')
    .contains('available_in_plan', [subscription?.plan_type || 'free'])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Generate New Document</h1>
          
          {/* Show credit balance */}
          <div className="bg-white shadow sm:rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Available Credits</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Each document generation uses 1 credit
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {credits?.amount || 0} credits
              </span>
            </div>
          </div>

          {/* Document Generator Component */}
          <DocumentGenerator 
            templates={templates || []}
            hasCredits={(credits?.amount || 0) > 0}
            userId={session.user.id}
          />
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'New Document - LegalDocs AI',
  description: 'Generate a new legal document using AI',
}
