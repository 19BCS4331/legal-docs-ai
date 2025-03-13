'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import axios from 'axios'
import { useToast } from '../shared/Toast'
import { CREDIT_PURCHASE_OPTIONS } from '@/utils/plans'
import { CreditCardIcon, PlusCircleIcon } from '@heroicons/react/24/outline'

interface PurchaseCreditsProps {
  userCredits: number
}

export default function PurchaseCredits({ userCredits }: PurchaseCreditsProps) {
  const [isLoading, setIsLoading] = useState<number | null>(null)
  const router = useRouter()
  const { showToast } = useToast()

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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <CreditCardIcon className="h-6 w-6 text-indigo-600 mr-2" />
        <h2 className="text-xl font-semibold">Purchase Additional Credits</h2>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-600">
          You currently have <span className="font-semibold text-indigo-600">{userCredits} credits</span> remaining.
          Need more? Purchase additional credits below.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {CREDIT_PURCHASE_OPTIONS.map((option) => (
          <div 
            key={option.amount}
            className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-medium">{option.amount} Credits</span>
              <span className="text-indigo-600 font-semibold">₹{option.price}</span>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              ₹{CREDIT_PURCHASE_OPTIONS[0].price / CREDIT_PURCHASE_OPTIONS[0].amount} per credit
            </p>
            <button
              onClick={() => handlePurchase(option.amount, option.price)}
              disabled={isLoading === option.amount}
              className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading === option.amount ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  <PlusCircleIcon className="h-4 w-4 mr-1" />
                  Buy Now
                </span>
              )}
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>* Credits never expire and can be used for any document generation or analysis.</p>
        <p>* Purchases are non-refundable.</p>
      </div>
    </div>
  )
}
