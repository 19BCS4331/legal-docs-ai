'use client'

import { MotionDiv, fadeIn } from '@/components/shared/animations'
import { useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
const stats = [
  { 
    id: 1, 
    name: 'Active users', 
    value: '8,000+',
    description: ''
  },
  { 
    id: 2, 
    name: 'Contracts generated', 
    value: '100k+',
    description: ''
  },
  { 
    id: 3, 
    name: 'Time saved', 
    value: '90%',
    description: ''
  },
  { 
    id: 4, 
    name: 'Cost reduction', 
    value: '85%',
    description: ''
  },
]

function CountUpAnimation({ value, suffix = '' }: { value: string, suffix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Extract number and any existing suffix
  const numericValue = value.match(/\d+/)?.[0] || ''
  const existingSuffix = value.replace(numericValue, '')
  const finalSuffix = suffix || existingSuffix

  if (!isMounted) {
    return <span ref={ref}>0{finalSuffix}</span>
  }

  return (
    <span ref={ref} className="tabular-nums">
      {isInView ? numericValue : '0'}{finalSuffix}
    </span>
  )
}

export function Stats() {
  return (
    <div className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <MotionDiv
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="mx-auto max-w-2xl lg:max-w-none"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Trusted by businesses worldwide
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Join thousands of satisfied customers who are saving time and money with our platform
            </p>
          </div>
          <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.id} className="flex flex-col bg-gray-400/5 p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-600">{stat.name}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">
                  <CountUpAnimation value={stat.value} />
                </dd>
              </div>
            ))}
          </dl>
        </MotionDiv>
      </div>
    </div>
  )
}
