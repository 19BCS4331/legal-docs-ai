import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { LandingLayout } from '@/components/landing/LandingLayout'
import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { KeyFeatures } from '@/components/landing/KeyFeatures'
import { Stats } from '@/components/landing/Stats'
import { Testimonials } from '@/components/landing/Testimonials'
import { CTASection } from '@/components/landing/CTASection'

export const metadata = {
  title: 'LegalDocs AI - Generate Legal Documents with AI',
  description: 'Create professional legal documents in minutes using AI. From NDAs to contracts, let AI handle the complexity while you focus on your business.',
}

export default async function HomePage() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie error
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie error
          }
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  return (
    <LandingLayout>
      <Hero isAuthenticated={!!session} />
      <HowItWorks />
      <KeyFeatures />
      <Stats />
      <Testimonials />
      <CTASection />
    </LandingLayout>
  )
}
