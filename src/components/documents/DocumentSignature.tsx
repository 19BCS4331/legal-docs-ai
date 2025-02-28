'use client'

import { useState } from 'react'
import { SignatureField } from './SignatureField'
import { PencilSquareIcon, CheckBadgeIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

interface DocumentSignatureProps {
  onSignatureAdd: (signature: string, position: string) => Promise<void>
  signatures?: { [key: string]: string }
  userRole?: 'creator' | 'signer'
}

export function DocumentSignature({ 
  onSignatureAdd, 
  signatures = {}, 
  userRole = 'creator' 
}: DocumentSignatureProps) {
  const [isSigningActive, setIsSigningActive] = useState(false)
  const [currentPosition, setCurrentPosition] = useState<string>('')

  const handleSignatureComplete = async (signature: string) => {
    try {
      await onSignatureAdd(signature, currentPosition)
      setIsSigningActive(false)
    } catch (error) {
      console.error('Error adding signature:', error)
    }
  }

  const signaturePositions = [
    { id: 'creator', label: 'Document Creator' },
    { id: 'signer', label: 'Document Signer' },
  ]

  return (
    <div className="mt-6 space-y-4">
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium text-gray-900">Document Signatures</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add or view signatures for this document
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {signaturePositions.map((position) => {
          const hasSignature = signatures[position.id]
          const canSign = (userRole === position.id) || userRole === 'creator'

          return (
            <div
              key={position.id}
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
            >
              <div className="flex-1 min-w-0">
                <div className="focus:outline-none">
                  <p className="text-sm font-medium text-gray-900">{position.label}</p>
                  {hasSignature ? (
                    <div className="mt-2">
                      <div className="relative h-20 w-40">
                        <Image
                          src={signatures[position.id]}
                          alt={`${position.label} signature`}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <p className="mt-1 text-sm text-green-600 flex items-center">
                        <CheckBadgeIcon className="h-5 w-5 mr-1" />
                        Signed
                      </p>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      {canSign ? 'Click to add signature' : 'Awaiting signature'}
                    </p>
                  )}
                </div>
              </div>
              {canSign && !hasSignature && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPosition(position.id)
                    setIsSigningActive(true)
                  }}
                  className="flex-shrink-0 p-2 text-indigo-600 hover:text-indigo-500 hover:bg-gray-50 rounded-full"
                >
                  <PencilSquareIcon className="h-6 w-6" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Signature Modal */}
      {isSigningActive && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <SignatureField
                onSave={handleSignatureComplete}
                onCancel={() => setIsSigningActive(false)}
                label={`Add ${currentPosition === 'creator' ? 'Creator' : 'Signer'} Signature`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
