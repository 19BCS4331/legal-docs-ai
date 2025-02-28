'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, UserPlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { DocumentCollaborator } from '@/types'

interface CollaboratorDialogProps {
  isOpen: boolean
  onClose: () => void
  collaborators: DocumentCollaborator[]
  onAddCollaborator: (email: string, role: DocumentCollaborator['role']) => Promise<void>
  onRemoveCollaborator: (id: string) => Promise<void>
  isEnterpriseUser: boolean
}

export function CollaboratorDialog({
  isOpen,
  onClose,
  collaborators,
  onAddCollaborator,
  onRemoveCollaborator,
  isEnterpriseUser
}: CollaboratorDialogProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<DocumentCollaborator['role']>('viewer')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isEnterpriseUser) {
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

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Enterprise Feature
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Document collaboration is available only for Enterprise users. Please upgrade your plan to access this feature.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    try {
      setIsSubmitting(true)
      setError(null)
      await onAddCollaborator(email.trim(), role)
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add collaborator')
    } finally {
      setIsSubmitting(false)
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

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                    Manage Collaborators
                  </Dialog.Title>

                  {/* Add Collaborator Form */}
                  <form onSubmit={handleSubmit} className="mt-4">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter email address"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                      <div className="w-32">
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value as DocumentCollaborator['role'])}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting || !email.trim()}
                        className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                      >
                        <UserPlusIcon className="h-4 w-4 mr-1" />
                        Add
                      </button>
                    </div>
                    {error && (
                      <p className="mt-2 text-sm text-red-600">{error}</p>
                    )}
                  </form>

                  {/* Collaborators List */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900">Current Collaborators</h4>
                    <ul role="list" className="mt-3 divide-y divide-gray-100 border-t border-gray-200">
                      {collaborators.map((collaborator) => (
                        <li key={collaborator.id} className="flex items-center justify-between gap-x-6 py-3">
                          <div className="min-w-0">
                            <div className="flex items-start gap-x-3">
                              <p className="text-sm font-semibold leading-6 text-gray-900">
                                {collaborator.user?.email}
                              </p>
                              <p className={`
                                rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset
                                ${collaborator.role === 'editor' 
                                  ? 'bg-blue-50 text-blue-700 ring-blue-700/10' 
                                  : 'bg-gray-50 text-gray-600 ring-gray-500/10'}
                              `}>
                                {collaborator.role}
                              </p>
                            </div>
                            {collaborator.user?.full_name && (
                              <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                                {collaborator.user.full_name}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveCollaborator(collaborator.id)}
                            className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          >
                            <TrashIcon className="h-4 w-4 text-gray-500" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
