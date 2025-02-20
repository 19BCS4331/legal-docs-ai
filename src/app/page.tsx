import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { LandingLayout } from '@/components/landing/LandingLayout'

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
            console.error('Error setting cookie:', error)
          }
        },
        remove(name: string, options: any) {
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

  return (
    <LandingLayout>
      <Hero isAuthenticated={!!session} />
      <Features />
    </LandingLayout>
  )
}
