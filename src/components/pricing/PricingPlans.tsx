'use client'

import { useState } from 'react'
import { CheckIcon } from '@heroicons/react/24/outline'
import { loadStripe } from '@stripe/stripe-js'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PricingPlansProps {
  currentPlan: string
  isAuthenticated: boolean
}

const plans = [
  {
    name: 'Free',
    id: 'free',
    priceMonthly: '₹0',
    description: 'Perfect for trying out our service',
    features: [
      '3 documents per month',
      'Basic templates',
      'Email support',
      'PDF export',
    ],
    documentsPerMonth: 3,
    stripePriceId: null,
  },
  {
    name: 'Pro',
    id: 'pro',
    priceMonthly: '₹999',
    description: 'For professionals and small businesses',
    features: [
      'Unlimited documents',
      'All templates',
      'Priority support',
      'PDF & Word export',
      'Custom branding',
      'API access (100 calls/month)',
    ],
    documentsPerMonth: -1, // unlimited
    stripePriceId: 'price_pro_monthly',
    isPopular: true,
  },
  {
    name: 'Enterprise',
    id: 'enterprise',
    priceMonthly: '₹4999',
    description: 'For large organizations',
    features: [
      'Unlimited documents',
      'All templates',
      '24/7 phone support',
      'All export formats',
      'Custom templates',
      'Unlimited API access',
      'SSO & Team management',
    ],
    documentsPerMonth: -1,
    stripePriceId: 'price_enterprise_monthly',
  },
]

export default function PricingPlans({ currentPlan, isAuthenticated }: PricingPlansProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubscribe = async (planId: string, stripePriceId: string | null) => {
    if (!isAuthenticated) {
      router.push('/auth?redirectTo=/pricing')
      return
    }

    if (!stripePriceId) return // Free plan

    setIsLoading(planId)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) throw new Error('Not authenticated')

      // Create Stripe Checkout Session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: stripePriceId,
          userId: session.user.id,
          planId,
        }),
      })

      const { sessionId } = await response.json()
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          throw error
        }
      }
    } catch (error) {
      console.error('Subscription error:', error)
      alert('Failed to process subscription. Please try again.')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
      {plans.map((plan) => {
        const isCurrentPlan = currentPlan === plan.id
        return (
          <div
            key={plan.name}
            className={`rounded-lg shadow-sm divide-y divide-gray-200 ${
              plan.isPopular ? 'border-2 border-indigo-500' : 'border border-gray-200'
            }`}
          >
            <div className="p-6">
              {plan.isPopular && (
                <p className="absolute top-0 -translate-y-1/2 transform">
                  <span className="inline-flex rounded-full bg-indigo-500 px-4 py-1 text-sm font-semibold text-white">
                    Most popular
                  </span>
                </p>
              )}
              <h2 className="text-lg font-medium text-gray-900">{plan.name}</h2>
              <p className="mt-4 text-sm text-gray-500">{plan.description}</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">{plan.priceMonthly}</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <button
                onClick={() => handleSubscribe(plan.id, plan.stripePriceId)}
                disabled={isLoading === plan.id || isCurrentPlan}
                className={`mt-8 block w-full rounded-md px-4 py-2 text-sm font-semibold text-center ${
                  isCurrentPlan
                    ? 'bg-gray-100 text-gray-600 cursor-default'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'
                }`}
              >
                {isLoading === plan.id
                  ? 'Processing...'
                  : isCurrentPlan
                  ? 'Current Plan'
                  : 'Subscribe'}
              </button>
            </div>
            <div className="px-6 pt-6 pb-8">
              <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                What's included
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex space-x-3">
                    <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      })}
    </div>
  )
}
