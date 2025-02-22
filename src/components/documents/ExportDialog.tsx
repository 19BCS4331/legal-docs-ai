'use client'

import React, { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Document } from '@/types'
import { DocumentArrowDownIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { exportDocument, ExportFormat } from '@/utils/documentExport'
import { useToast } from '../shared/Toast'
import html2pdf from 'html2pdf.js'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ExportDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  documentData: Document
}

export function ExportDialog({ isOpen, setIsOpen, documentData }: ExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf')
  const { showToast } = useToast()

  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      // Create a temporary div for rendering
      const tempDiv = window.document.createElement('div')
      tempDiv.className = 'pdf-export'
      
      // Add export styles
      const styleSheet = window.document.createElement('style')
      styleSheet.textContent = `
        .pdf-export {
          padding: 40px;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        .pdf-export h1 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #111827;
        }
        .pdf-export h2 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #1f2937;
        }
        .pdf-export h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #374151;
        }
        .pdf-export p {
          margin-bottom: 12px;
          line-height: 1.6;
          color: #374151;
        }
        .pdf-export ul, .pdf-export ol {
          margin-bottom: 12px;
          padding-left: 24px;
        }
        .pdf-export li {
          margin-bottom: 4px;
        }
        .pdf-export strong {
          font-weight: 600;
          color: #111827;
        }
        .pdf-export em {
          font-style: italic;
        }
      `
      window.document.head.appendChild(styleSheet)

      // Create root element for ReactMarkdown
      const root = window.document.createElement('div')
      root.className = 'pdf-content'
      tempDiv.appendChild(root)
      window.document.body.appendChild(tempDiv)

      // Render Markdown content
      const ReactDOMServer = (await import('react-dom/server')).default
      const markdownContent = (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
        >
          {documentData.content}
        </ReactMarkdown>
      )
      root.innerHTML = ReactDOMServer.renderToString(markdownContent)

      // Configure PDF options
      const opt = {
        margin: [15, 15],
        filename: `${documentData.title}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      }

      // Generate PDF
      await html2pdf().set(opt).from(tempDiv).save()

      // Cleanup
      window.document.body.removeChild(tempDiv)
      window.document.head.removeChild(styleSheet)
      setIsOpen(false)
    } catch (error) {
      console.error('Error exporting to PDF:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const downloadAsMarkdown = () => {
    const element = window.document.createElement('a')
    const file = new Blob([documentData.content], { type: 'text/markdown' })
    element.href = URL.createObjectURL(file)
    element.download = `${documentData.title}.md`
    window.document.body.appendChild(element)
    element.click()
    window.document.body.removeChild(element)
    setIsOpen(false)
  }

  const handleExport = async () => {
    if (selectedFormat === 'pdf') {
      await exportToPDF()
    } else if (selectedFormat === 'markdown') {
      downloadAsMarkdown()
    } else {
      try {
        setIsExporting(true)
        await exportDocument(documentData, selectedFormat)
        showToast('success', 'Document exported', `Successfully exported "${documentData.title}" as ${selectedFormat.toUpperCase()}`)
        setIsOpen(false)
      } catch (err) {
        console.error('Error exporting document:', err)
        showToast('error', 'Export failed', 'Failed to export document. Please try again.')
      } finally {
        setIsExporting(false)
      }
    }
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
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
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <DocumentArrowDownIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Export Document
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Choose a format to export "{documentData.title}".
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Export Format
                    </label>
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="pdf">PDF Document (.pdf)</option>
                      <option value="markdown">Markdown (.md)</option>
                      <option value="txt">Plain Text (.txt)</option>
                    </select>
                  </div>

                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleExport}
                      disabled={isExporting}
                    >
                      {isExporting ? 'Exporting...' : 'Export'}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
