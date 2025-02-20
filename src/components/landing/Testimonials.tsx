'use client'

import { MotionDiv, fadeIn, staggerContainer, GradientBackground } from '@/components/shared/animations'

const testimonials = [
  {
    body: 'I needed an employment contract for my startup but couldn\'t afford expensive legal fees. Legal Docs AI created a perfect contract in minutes, saving me thousands of dollars.',
    author: {
      name: 'Sarah Chen',
      handle: 'Startup Founder',
      company: 'Tech Innovations Inc.',
      imageUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    body: 'As a freelancer, I need different contracts for various clients. This platform has been a game-changer - I can create custom contracts instantly without any legal background.',
    author: {
      name: 'Michael Rodriguez',
      handle: 'Independent Contractor',
      company: 'Digital Solutions',
      imageUrl:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    body: 'The contracts are written in plain English while maintaining legal validity. No more confusing legal jargon. It\'s like having a lawyer who speaks your language.',
    author: {
      name: 'Emily Thompson',
      handle: 'Small Business Owner',
      company: 'Thompson Retail',
      imageUrl:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
]

export function Testimonials() {
  return (
    <div className="relative bg-gradient-to-b from-white via-indigo-50/20 to-white py-24 sm:py-32">
      <GradientBackground />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <MotionDiv
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeIn}
          className="mx-auto max-w-xl text-center"
        >
          <h2 className="text-lg font-semibold leading-8 tracking-tight text-indigo-600">Testimonials</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Trusted by Businesses & Individuals
          </p>
        </MotionDiv>
        <MotionDiv
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none"
        >
          <div className="-mt-8 sm:-mx-4 sm:columns-2 sm:text-[0] lg:columns-3">
            {testimonials.map((testimonial) => (
              <MotionDiv
                key={testimonial.author.handle}
                variants={fadeIn}
                className="pt-8 sm:inline-block sm:w-full sm:px-4"
              >
                <figure className="rounded-2xl bg-white/50 backdrop-blur-sm p-8 text-sm leading-6 shadow-sm ring-1 ring-gray-900/5 hover:shadow-lg transition-shadow duration-200">
                  <blockquote className="text-gray-900">
                    <p>{`"${testimonial.body}"`}</p>
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-x-4">
                    <img
                      className="h-10 w-10 rounded-full bg-gray-50 ring-2 ring-indigo-600/10"
                      src={testimonial.author.imageUrl}
                      alt=""
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.author.name}</div>
                      <div className="text-gray-600">{`${testimonial.author.handle} at ${testimonial.author.company}`}</div>
                    </div>
                  </figcaption>
                </figure>
              </MotionDiv>
            ))}
          </div>
        </MotionDiv>
      </div>
    </div>
  )
}
