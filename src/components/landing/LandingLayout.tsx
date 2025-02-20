'use client'

import { TopNavbar } from '@/components/layout/TopNavbar'

interface LandingLayoutProps {
  children: React.ReactNode
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="bg-white">
      <TopNavbar />
      {children}
    </div>
  )
}
