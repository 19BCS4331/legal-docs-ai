'use client'

import { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { PlusIcon, MinusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useToast } from '../shared/Toast'
import { CREDIT_PURCHASE_OPTIONS, CREDIT_PRICE_PER_UNIT } from '@/utils/plans'

interface PurchaseCreditsModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function PurchaseCreditsModal({ isOpen, onClose, onSuccess }: PurchaseCreditsModalProps) {
  const [isLoading, setIsLoading] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState(1)
  const [isVerifying, setIsVerifying] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()

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
            setIsVerifying(true);
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
              onClose()
              if (onSuccess) {
                onSuccess()
              }
            } else {
              showToast('error', 'Payment verification failed')
            }
          } catch (error) {
            console.error('Error verifying payment:', error)
            showToast('error', 'Error verifying payment')
          } finally {
            setIsLoading(null)
            setIsVerifying(false)
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
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div>
                  <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                    Purchase Credits
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Each credit costs ₹{CREDIT_PRICE_PER_UNIT} and allows you to generate or analyze one document.
                    </p>
                  </div>
                </div>

                <div className="mt-4">
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
                          disabled={customAmount <= 1 || isLoading !== null || isVerifying}
                          className="p-1 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-50 disabled:hover:text-gray-500 disabled:hover:border-gray-200"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        
                        <span className="mx-3 text-lg font-medium w-8 text-center">{customAmount}</span>
                        
                        <button 
                          onClick={incrementCustomAmount}
                          disabled={isLoading !== null || isVerifying}
                          className="p-1 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-50"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handlePurchase(customAmount, customAmount * CREDIT_PRICE_PER_UNIT)}
                        disabled={isLoading !== null || isVerifying}
                        className="py-1.5 px-3 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading === customAmount ? 'Processing...' : 'Purchase'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Predefined options */}
                  <div className="grid grid-cols-1 gap-3">
                    <h4 className="text-sm font-medium text-gray-900">Popular Options</h4>
                    {CREDIT_PURCHASE_OPTIONS.map((option) => (
                      <div key={option.amount} className="flex justify-between items-center p-3 border rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                        <div>
                          <p className="font-medium text-gray-900">{option.amount} Credits</p>
                          <p className="text-xs text-gray-500">{option.amount === 5 ? 'Small project' : 
                            option.amount === 10 ? 'Medium project' : 
                            option.amount === 20 ? 'Large project' : 
                            option.amount === 50 ? 'Team usage' : 
                            'Enterprise usage'}</p>
                        </div>
                        <button
                          onClick={() => handlePurchase(option.amount, option.price)}
                          disabled={isLoading !== null || isVerifying}
                          className="py-1.5 px-3 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading === option.amount ? 'Processing...' : `₹${option.price}`}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Payment verification overlay */}
                {isVerifying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                      <p className="mt-4 text-indigo-600 font-medium">Verifying your payment...</p>
                      <p className="text-sm text-gray-500 mt-2">Please wait, this may take a moment.</p>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
