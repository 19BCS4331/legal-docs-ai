'use client'

import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { FunnelIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { CheckIcon } from '@heroicons/react/24/outline'

export type SortOption = 'updated_desc' | 'updated_asc' | 'name_asc' | 'name_desc'
export type StatusFilter = 'all' | 'draft' | 'in_review' | 'completed'

const sortOptions = [
  { name: 'Most Recent', value: 'updated_desc' as const },
  { name: 'Oldest', value: 'updated_asc' as const },
  { name: 'Name (A-Z)', value: 'name_asc' as const },
  { name: 'Name (Z-A)', value: 'name_desc' as const },
]

const statusFilters = [
  { name: 'All', value: 'all' as const },
  { name: 'Draft', value: 'draft' as const },
  { name: 'In Review', value: 'in_review' as const },
  { name: 'Completed', value: 'completed' as const },
]

type DocumentFiltersProps = {
  onSortChange: (value: SortOption) => void
  onStatusChange: (value: StatusFilter) => void
  currentSort: SortOption
  currentStatus: StatusFilter
}

export function DocumentFilters({ onSortChange, onStatusChange, currentSort, currentStatus }: DocumentFiltersProps) {
  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
      {/* Sort Dropdown */}
      <Menu as="div" className="relative">
        <Menu.Button className="inline-flex items-center gap-x-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300/50 hover:ring-gray-300 transition-all">
          Sort by
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-xl bg-white py-2 shadow-lg ring-1 ring-black/5 focus:outline-none">
            {sortOptions.map((option) => (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <button
                    onClick={() => onSortChange(option.value)}
                    className={`
                      flex w-full items-center px-4 py-2 text-sm
                      ${active ? 'bg-gray-50' : ''}
                      ${currentSort === option.value ? 'text-indigo-600 font-medium' : 'text-gray-700'}
                    `}
                  >
                    {option.name}
                    {currentSort === option.value && (
                      <CheckIcon className="ml-auto h-4 w-4" />
                    )}
                  </button>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Transition>
      </Menu>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <FunnelIcon className="h-5 w-5 text-gray-400" />
        <div className="flex flex-wrap items-center gap-2">
          {statusFilters.map((status) => (
            <button
              key={status.value}
              onClick={() => onStatusChange(status.value)}
              className={`
                rounded-lg px-3 py-2 text-sm font-medium transition-all
                ${currentStatus === status.value
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                  : 'text-gray-700 hover:text-indigo-600'
                }
              `}
            >
              {status.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
