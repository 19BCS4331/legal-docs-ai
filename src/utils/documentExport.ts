import { Document } from '@/types'
import { jsPDF } from 'jspdf'
import { marked } from 'marked'

export type ExportFormat = 'pdf' | 'markdown' | 'txt'

export async function exportDocument(document: Document, format: ExportFormat): Promise<void> {
  const filename = `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`

  switch (format) {
    case 'pdf':
      await exportToPdf(document, filename)
      break
    case 'markdown':
      await exportToMarkdown(document, filename)
      break
    case 'txt':
      await exportToTxt(document, filename)
      break
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}

async function exportToPdf(document: Document, filename: string): Promise<void> {
  const pdf = new jsPDF()
  
  // Add title
  pdf.setFontSize(20)
  pdf.text(document.title, 20, 20)
  
  // Add content
  pdf.setFontSize(12)
  const content = await marked(document.content)
  // Remove HTML tags for PDF
  const plainText = content.replace(/<[^>]*>/g, '')
  
  // Split text into lines that fit the page width
  const lines = pdf.splitTextToSize(plainText, pdf.internal.pageSize.width - 40)
  
  // Add lines to PDF, creating new pages as needed
  let y = 40
  lines.forEach((line: string) => {
    if (y > pdf.internal.pageSize.height - 20) {
      pdf.addPage()
      y = 20
    }
    pdf.text(line, 20, y)
    y += 7
  })
  
  pdf.save(`${filename}.pdf`)
}

async function exportToMarkdown(document: Document, filename: string): Promise<void> {
  const content = `# ${document.title}\n\n${document.content}`
  downloadFile(content, `${filename}.md`, 'text/markdown')
}

async function exportToTxt(document: Document, filename: string): Promise<void> {
  // Convert markdown to plain text
  const content = await marked(document.content)
  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, '')
  downloadFile(plainText, `${filename}.txt`, 'text/plain')
}

function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
