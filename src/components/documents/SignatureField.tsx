'use client'

import { useState, useRef, useEffect } from 'react'
import SignaturePad from 'react-signature-canvas'
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'

interface SignatureFieldProps {
  onSave: (signature: string) => void
  onCancel: () => void
  label?: string
}

export function SignatureField({ onSave, onCancel, label = 'Signature' }: SignatureFieldProps) {
  const signaturePad = useRef<any>(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect()
      setDimensions({ width, height: 200 })
    }
  }, [])

  const clear = () => {
    if (signaturePad.current) {
      signaturePad.current.clear()
      setIsEmpty(true)
    }
  }

  const optimizeSignature = (canvas: HTMLCanvasElement): string => {
    // Create a temporary canvas for resizing
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return canvas.toDataURL()

    // Set optimized dimensions (max 600px width while maintaining aspect ratio)
    const maxWidth = 600
    const scale = Math.min(1, maxWidth / canvas.width)
    tempCanvas.width = canvas.width * scale
    tempCanvas.height = canvas.height * scale

    // Draw resized image
    tempCtx.scale(scale, scale)
    tempCtx.drawImage(canvas, 0, 0)

    // Convert to compressed PNG
    return tempCanvas.toDataURL('image/png', 0.5)
  }

  const save = () => {
    if (!isEmpty && signaturePad.current) {
      const canvas = signaturePad.current.getTrimmedCanvas()
      const optimizedSignature = optimizeSignature(canvas)
      onSave(optimizedSignature)
    }
  }

  return (
    <div className="bg-white rounded-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{label}</h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>
      
      <div ref={containerRef} className="border-2 border-gray-300 rounded-lg bg-white">
        {dimensions.width > 0 && (
          <SignaturePad
            ref={signaturePad}
            canvasProps={{
              width: dimensions.width,
              height: dimensions.height,
              className: 'signature-canvas',
            }}
            onBegin={() => setIsEmpty(false)}
          />
        )}
      </div>

      <div className="mt-4 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={isEmpty}
          className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Save Signature
        </button>
      </div>
    </div>
  )
}
