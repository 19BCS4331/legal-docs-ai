import './globals.css'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Navbar } from '@/components/layout/Navbar'
import { ToastProvider } from '@/components/shared/Toast'

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta'
})

export const metadata = {
  title: 'Legal Docs AI',
  description: 'AI-powered legal document management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className={`${jakarta.className} h-full antialiased`}>
        <ToastProvider>
          <Navbar />
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
