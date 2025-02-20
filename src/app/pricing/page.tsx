import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import PricingPlans from '../../components/pricing/PricingPlans'

export default async function PricingPage() {
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

  const { data: { session } } = await supabase.auth.getSession()
  
  const { data: subscription } = session ? await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', session.user.id)
    .single() : { data: null }

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Choose the plan that best fits your needs
          </p>
        </div>

        <PricingPlans 
          currentPlan={subscription?.plan_type || 'free'}
          isAuthenticated={!!session}
        />
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Pricing - LegalDocs AI',
  description: 'Simple and transparent pricing plans for LegalDocs AI',
}
