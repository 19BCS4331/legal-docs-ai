'use client'

import { useState } from 'react'
import { CheckIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import axios from 'axios'
import { useToast } from '../shared/Toast';
import { plans } from '@/utils/plans'

interface PricingPlansProps {
  currentPlan: string
  isAuthenticated: boolean
}

export default function PricingPlans({ currentPlan, isAuthenticated }: PricingPlansProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const router = useRouter()
  const { showToast } = useToast();

  const handlePayment = async (plan: typeof plans[0]) => {
    if (!isAuthenticated) {
      router.push('/auth?redirectTo=/pricing')
      return
    }

    if (plan.id === 'free') {
      // Prevent subscription to free plan if already on Pro or Enterprise
      if (currentPlan === 'pro' || currentPlan === 'enterprise') {
        showToast('error', 'Cannot subscribe to Free plan.', 'You are currently on a paid plan.');
        return;
      }

      showToast('info', 'You are already on the Free plan.', 'Enjoy our services!');
      return;
    }

    setIsLoading(plan.id)

    try {
      // Create order
      const orderResponse = await axios.post('/api/createOrder', {
        amount: plan.amount,
        currency: 'INR',
        planId: plan.id,
      })

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: plan.amount * 100, // Amount in paise
        currency: 'INR',
        name: 'LegalDocs AI',
        description: `Subscribe to ${plan.name} Plan`,
        order_id: orderResponse.data.id,
        handler: async function (response: any) {
          try {
            setIsVerifying(true)
            const verifyResponse = await axios.post('/api/verifyOrder', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.id,
              amount: plan.amount
            })

            if (verifyResponse.data.success) {
              showToast('success', 'Payment successful!', `Your subscription to the ${plan.name} plan is now active.`);
              router.push('/dashboard');
            } else {
              showToast('error', 'Payment verification failed.', 'Please contact support for assistance.');
            }
          } catch (error) {
            console.error('Payment verification failed:', error)
            showToast('error', 'Payment verification failed.', 'Please contact support for assistance.');
          } finally {
            setIsVerifying(false)
          }
        },
        prefill: {
          name: 'User',
          email: 'user@example.com',
        },
        theme: {
          color: '#4F46E5',
        },
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.on('payment.failed', function (response: any) {
        showToast('error', 'Payment failed.', 'Please try again.');
        console.error('Payment failed:', response.error)
      })
      razorpay.open()
    } catch (error) {
      console.error('Error initiating payment:', error)
      showToast('error', 'Failed to initiate payment.', 'Please try again.');
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <>
      {/* Loading overlay for verification */}
      {isVerifying && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verifying Payment</h3>
              <p className="text-gray-600 text-center">
                Please wait while we verify your payment and update your subscription.
                This may take a few moments.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id
          return (
            <div
              key={plan.name}
              className={`relative rounded-2xl ${
                plan.isPopular 
                  ? 'border-2 border-indigo-500 shadow-xl' 
                  : 'border border-gray-200 shadow-sm'
              } bg-white`}
            >
              {plan.isPopular && (
                <div className="absolute -top-5 inset-x-0 flex items-center justify-center">
                  <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold tracking-wide bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md">
                    <SparklesIcon className="w-4 h-4 mr-1" />
                    Most Popular
                  </span>
                </div>
              )}
              <div className="p-8">
                <h2 className="text-2xl font-bold leading-8 text-gray-900">{plan.name}</h2>
                <p className="mt-4 text-sm text-gray-500">{plan.description}</p>
                <p className="mt-8 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">{plan.priceMonthly}</span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">/month</span>
                </p>
                <button
                  onClick={() => handlePayment(plan)}
                  disabled={isLoading === plan.id || isCurrentPlan || isVerifying}
                  className={`mt-8 block w-full rounded-lg px-4 py-3.5 text-sm font-semibold text-center shadow-sm transition-all duration-150 ease-in-out ${
                    isCurrentPlan 
                      ? 'bg-gray-100 text-indigo-600 cursor-default border-2 border-indigo-500'
                      : plan.isPopular
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50'
                  }`}
                >
                  {isLoading === plan.id
                    ? 'Processing...'
                    : isVerifying
                    ? 'Verifying...'
                    : isCurrentPlan
                    ? 'Current Plan'
                    : 'Get Started'}
                </button>
              </div>
              <div className="px-8 pb-8">
                <h3 className="text-xs font-semibold text-gray-900 tracking-wide uppercase">
                  Features included
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
    </>
  )
}
