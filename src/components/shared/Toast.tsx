'use client'

import { Fragment, createContext, useContext, useState, useCallback } from 'react'
import { Transition } from '@headlessui/react'
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { XMarkIcon } from '@heroicons/react/20/solid'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  type: ToastType
  title: string
  message?: string
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, title, message }])

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 5000)
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-[9999]"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {toasts.map((toast) => (
            <Transition
              key={toast.id}
              show={true}
              as={Fragment}
              enter="transform ease-out duration-300 transition"
              enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
              enterTo="translate-y-0 opacity-100 sm:translate-x-0"
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {toast.type === 'success' && (
                        <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
                      )}
                      {toast.type === 'error' && (
                        <XCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
                      )}
                      {toast.type === 'info' && (
                        <InformationCircleIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />
                      )}
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                      <p className="text-sm font-medium text-gray-900">{toast.title}</p>
                      {toast.message && (
                        <p className="mt-1 text-sm text-gray-500">{toast.message}</p>
                      )}
                    </div>
                    <div className="ml-4 flex flex-shrink-0">
                      <button
                        type="button"
                        className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        onClick={() => removeToast(toast.id)}
                      >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}