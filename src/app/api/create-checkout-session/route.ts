import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const { priceId, userId, planId } = await request.json()

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

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.id !== userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get or create Stripe customer
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    let customerId = subscription?.stripe_customer_id

    if (!customerId) {
      // Get user email from Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single()

      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: profile?.email || session.user.email,
        metadata: {
          userId,
        },
      })
      customerId = customer.id

      // Store Stripe customer ID
      await supabase.from('subscriptions').insert({
        user_id: userId,
        stripe_customer_id: customerId,
        plan_type: 'free',
        status: 'inactive',
      })
    }

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/pricing`,
      metadata: {
        userId,
        planId,
      },
    })

    return NextResponse.json({ sessionId: checkoutSession.id })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return new NextResponse('Error creating checkout session', { status: 500 })
  }
}
