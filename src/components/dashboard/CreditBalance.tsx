'use client'

import { useState } from 'react'
import { UserCredits, UserSubscription } from '@/types'
import { CreditCardIcon, SparklesIcon, PlusCircleIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useToast } from '../shared/Toast'
import { CREDIT_PURCHASE_OPTIONS, CREDIT_PRICE_PER_UNIT } from '@/utils/plans'

interface CreditBalanceProps {
  credits: UserCredits | null
  subscription: UserSubscription | null
}

export function CreditBalance({ credits, subscription }: CreditBalanceProps) {
  const [isLoading, setIsLoading] = useState<number | null>(null)
  const [showPurchaseOptions, setShowPurchaseOptions] = useState(false)
  const [customAmount, setCustomAmount] = useState(1)
  const router = useRouter()
  const { showToast } = useToast()
  
  const planType = subscription?.plan_type || 'free'
  const isUpgradeable = planType === 'free' || planType === 'pro'
  const creditBalance = credits?.amount || 0

  const incrementCustomAmount = () => {
    setCustomAmount(prev => prev + 1)
  }

  const decrementCustomAmount = () => {
    setCustomAmount(prev => (prev > 1 ? prev - 1 : 1))
  }

  // Initialize Razorpay
  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        resolve(true)
      }
      script.onerror = () => {
        resolve(false)
      }
      document.body.appendChild(script)
    })
  }

  const handlePurchase = async (creditAmount: number, price: number) => {
    try {
      setIsLoading(creditAmount)
      
      // Initialize Razorpay
      const res = await initializeRazorpay()
      if (!res) {
        showToast('error', 'Razorpay SDK failed to load')
        setIsLoading(null)
        return
      }

      // Create order
      const orderData = await axios.post('/api/createOrder', {
        amount: price,
        currency: 'INR',
        receipt: `credit-purchase-${Date.now()}`,
        notes: {
          creditAmount: creditAmount,
          type: 'credit-purchase'
        }
      })

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: price * 100, // Amount in paise
        currency: 'INR',
        name: 'Legal Docs AI',
        description: `Purchase ${creditAmount} Credits`,
        order_id: orderData.data.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const { data } = await axios.post('/api/purchaseCredits', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              creditAmount: creditAmount
            })

            if (data.success) {
              showToast('success', `Successfully added ${creditAmount} credits!`)
              router.refresh()
              setShowPurchaseOptions(false)
            } else {
              showToast('error', 'Payment verification failed')
            }
          } catch (error) {
            console.error('Error verifying payment:', error)
            showToast('error', 'Error verifying payment')
          } finally {
            setIsLoading(null)
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#6366F1',
        },
        modal: {
          ondismiss: function() {
            setIsLoading(null)
          }
        }
      }

      // @ts-ignore
      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
    } catch (error) {
      console.error('Error:', error)
      showToast('error', 'Something went wrong')
      setIsLoading(null)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Account Status</h3>
      <div className="space-y-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <SparklesIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-900">Current Plan</p>
            <p className="text-2xl font-semibold text-indigo-600 capitalize">{planType}</p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CreditCardIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-900">Available Credits</p>
            <p className="text-2xl font-semibold text-indigo-600">{creditBalance}</p>
          </div>
        </div>
        
        <div className="flex flex-col space-y-3 mt-4">
          {isUpgradeable && (
            <Link
              href="/pricing"
              className="block w-full bg-indigo-600 text-white text-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Upgrade Plan
            </Link>
          )}
          
          <button
            onClick={() => setShowPurchaseOptions(!showPurchaseOptions)}
            className="w-full flex items-center justify-center py-2 px-4 border border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircleIcon className="h-4 w-4 mr-1" />
            {showPurchaseOptions ? 'Hide Purchase Options' : 'Buy Additional Credits'}
          </button>
        </div>
        
        {showPurchaseOptions && (
          <div className="mt-4 border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Purchase Credits</h4>
            <p className="text-xs text-gray-500 mb-3">Each credit costs ₹20 and allows you to generate or analyze one document.</p>
            
            {/* Custom amount selector */}
            <div className="mb-4 p-3 border border-indigo-100 bg-indigo-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900">Custom Amount</span>
                <span className="text-indigo-600 font-semibold">₹{customAmount * CREDIT_PRICE_PER_UNIT}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button 
                    onClick={decrementCustomAmount}
                    disabled={customAmount <= 1}
                    className="p-1 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-50 disabled:hover:text-gray-500 disabled:hover:border-gray-200"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  
                  <span className="mx-3 text-lg font-medium w-8 text-center">{customAmount}</span>
                  
                  <button 
                    onClick={incrementCustomAmount}
                    className="p-1 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-300"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                
                <button
                  onClick={() => handlePurchase(customAmount, customAmount * CREDIT_PRICE_PER_UNIT)}
                  disabled={isLoading === customAmount}
                  className="flex items-center justify-center py-1 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading === customAmount ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <span>Buy Now</span>
                  )}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CREDIT_PURCHASE_OPTIONS.map((option) => (
                <button
                  key={option.amount}
                  onClick={() => handlePurchase(option.amount, option.price)}
                  disabled={isLoading === option.amount}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded hover:border-indigo-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center">
                    <PlusCircleIcon className="h-4 w-4 text-indigo-600 mr-2" />
                    <span className="text-sm font-medium">{option.amount} Credits</span>
                  </div>
                  <div className="flex items-center">
                    {isLoading === option.amount ? (
                      <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <span className="text-sm font-semibold text-indigo-600">₹{option.price}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            <p className="text-xs text-gray-500 mt-3">
              * Credits never expire and can be used for any document generation or analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
