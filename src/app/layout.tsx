'use client'

import './globals.css'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { ToastProvider } from '@/components/shared/Toast'
import { usePathname } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta'
})

const protectedPaths = ['/dashboard', '/documents', '/tags', '/profile']

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isProtectedRoute = protectedPaths.some(path => pathname?.startsWith(path))

  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className={`${jakarta.className} h-full antialiased`}>
        <ToastProvider>
          {isProtectedRoute ? (
            <DashboardLayout>{children}</DashboardLayout>
          ) : (
            children
          )}
        </ToastProvider>
      </body>
    </html>
  )
}
