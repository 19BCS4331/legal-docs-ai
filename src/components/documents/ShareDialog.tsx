'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ShareIcon, XMarkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { Document } from '@/types'
import { createBrowserClient } from '@supabase/ssr'
import { useToast } from '../shared/Toast'

interface ShareDialogProps {
  isOpen: boolean
  document: Document
  onClose: () => void
}

export function ShareDialog({ isOpen, document, onClose }: ShareDialogProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [email, setEmail] = useState('')
  const { showToast } = useToast()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    try {
      setIsSharing(true)
      
      // First, check if the user exists
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (userError || !users) {
        showToast('error', 'User not found', 'Please check the email address and try again.')
        return
      }

      // Add document sharing record
      const { error: shareError } = await supabase
        .from('document_shares')
        .insert({
          document_id: document.id,
          shared_with: users.id,
          shared_by: document.user_id,
          created_at: new Date().toISOString()
        })

      if (shareError) throw shareError

      showToast('success', 'Document shared', `"${document.title}" has been shared with ${email}`)
      setEmail('')
      onClose()
    } catch (err) {
      console.error('Error sharing document:', err)
      showToast('error', 'Error sharing document', 'The document could not be shared. Please try again.')
    } finally {
      setIsSharing(false)
    }
  }

  const copyShareLink = async () => {
    const shareLink = `${window.location.origin}/documents/shared/${document.id}`
    try {
      await navigator.clipboard.writeText(shareLink)
      showToast('success', 'Link copied', 'Share link has been copied to clipboard')
    } catch (err) {
      showToast('error', 'Error copying link', 'Could not copy the share link')
    }
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ShareIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Share Document
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Share "{document.title}" with other users.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <form onSubmit={handleShare} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={copyShareLink}
                        className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        <ClipboardDocumentIcon className="h-5 w-5 mr-2 text-gray-400" aria-hidden="true" />
                        Copy Share Link
                      </button>
                      <button
                        type="submit"
                        disabled={isSharing || !email}
                        className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSharing ? 'Sharing...' : 'Share'}
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
