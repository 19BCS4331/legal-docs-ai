'use client'

import { User } from '@supabase/supabase-js'
import { MotionDiv, fadeIn } from '@/components/shared/animations'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface WelcomeCardProps {
  user: User
  profile: any
}

export function WelcomeCard({ user, profile }: WelcomeCardProps) {
  const userName = profile?.full_name || user.email?.split('@')[0] || 'there'
  const [greeting, setGreeting] = useState('Hello')

  useEffect(() => {
    const hours = new Date().getHours()
    if (hours >= 5 && hours < 12) setGreeting('Good morning')
    else if (hours >= 12 && hours < 17) setGreeting('Good afternoon')
    else if (hours >= 17 && hours < 22) setGreeting('Good evening')
    else setGreeting('Good evening')
  }, [])

  return (
    <MotionDiv
      initial="initial"
      animate="animate"
      variants={fadeIn}
      className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 p-8 shadow-lg"
    >
      <div className="relative z-10">
        <h1 className="text-2xl font-semibold text-white">
          {greeting}, {userName}! 👋
        </h1>
        <p className="mt-2 max-w-xl text-indigo-100">
          Welcome to your dashboard. Create, manage, and track your legal documents all in one place.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/documents/new"
            className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 transition-colors"
          >
            Create New Document
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute right-0 top-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute right-0 bottom-0 -mb-10 -mr-10 h-32 w-32 rounded-full bg-white/10" />
    </MotionDiv>
  )
}
