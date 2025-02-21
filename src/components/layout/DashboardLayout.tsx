'use client'

import { SideNav } from './SideNav'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <>
      <SideNav />
      <div className="lg:pl-72">
        <main>
          <div>{children}</div>
        </main>
      </div>
    </>
  )
}
