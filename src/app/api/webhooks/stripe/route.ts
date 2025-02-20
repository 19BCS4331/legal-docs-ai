import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/client'

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  try {
    if (!sig || !webhookSecret) {
      console.error('Missing Stripe webhook secret or signature')
      return new NextResponse('Webhook Error', { status: 400 })
    }

    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (!relevantEvents.has(event.type)) {
    return new NextResponse('Irrelevant event type', { status: 200 })
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return undefined // No cookies needed for webhook
        },
        set(name: string, value: string, options: any) {
          return // No cookies needed for webhook
        },
        remove(name: string, options: any) {
          return // No cookies needed for webhook
        },
      },
    }
  )

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session
        const subscription = await stripe.subscriptions.retrieve(checkoutSession.subscription as string)
        
        await supabase
          .from('subscriptions')
          .update({
            stripe_subscription_id: subscription.id,
            plan_type: checkoutSession.metadata?.planId || 'pro',
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('user_id', checkoutSession.metadata?.userId)

        // Add initial credits for new subscribers
        const initialCredits = checkoutSession.metadata?.planId === 'pro' ? 50 : 100
        
        await supabase.from('credits').upsert({
          user_id: checkoutSession.metadata?.userId,
          amount: initialCredits,
        })

        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const status = subscription.status
        const customerId = subscription.customer as string

        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (subscriptionData) {
          await supabase
            .from('subscriptions')
            .update({
              status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('user_id', subscriptionData.user_id)
        }

        break
      }

      default:
        throw new Error('Unhandled relevant event!')
    }

    return new NextResponse('Webhook processed successfully', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new NextResponse('Webhook handler failed', { status: 500 })
  }
}
