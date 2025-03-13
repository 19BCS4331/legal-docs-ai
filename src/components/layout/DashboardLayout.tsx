'use client'

import { SideNav } from './SideNav'
import { SessionValidator } from '@/components/auth/SessionValidator'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <>
      {/* Add SessionValidator to check if user session is still valid */}
      <SessionValidator />
      <SideNav />
      <div className="lg:pl-72">
        <main>
          <div>{children}</div>
        </main>
      </div>
    </>
  )
}
