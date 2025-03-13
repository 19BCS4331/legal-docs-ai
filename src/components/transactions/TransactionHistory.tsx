'use client'

import { useState, useMemo } from 'react'
import { 
  CreditCardIcon, 
  DocumentTextIcon, 
  FunnelIcon, 
  ArrowDownTrayIcon, 
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { Transaction } from '@/types'

interface TransactionHistoryProps {
  transactions: Transaction[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: 'all',
    search: '',
    showFilters: false
  })

  // Filter transactions based on selected filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Filter by type
      if (filters.type !== 'all' && transaction.transaction_type !== filters.type) {
        return false
      }

      // Filter by status
      if (filters.status !== 'all' && transaction.status !== filters.status) {
        return false
      }

      // Filter by date range
      if (filters.dateRange !== 'all') {
        const transactionDate = new Date(transaction.created_at)
        const today = new Date()
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(today.getDate() - 30)
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(today.getDate() - 90)
        
        if (filters.dateRange === 'last30days' && transactionDate < thirtyDaysAgo) {
          return false
        }
        
        if (filters.dateRange === 'last90days' && transactionDate < ninetyDaysAgo) {
          return false
        }
      }

      // Filter by search term (check in transaction ID, payment ID, or plan type)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const idMatch = transaction.id.toLowerCase().includes(searchLower)
        const paymentIdMatch = transaction.gateway_payment_id.toLowerCase().includes(searchLower)
        const planMatch = transaction.plan_type ? transaction.plan_type.toLowerCase().includes(searchLower) : false
        
        if (!idMatch && !paymentIdMatch && !planMatch) {
          return false
        }
      }

      return true
    })
  }, [transactions, filters])

  // Calculate total amount for filtered transactions
  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, transaction) => {
      return sum + (transaction.amount || 0)
    }, 0)
  }, [filteredTransactions])

  const resetFilters = () => {
    setFilters({
      type: 'all',
      status: 'all',
      dateRange: 'all',
      search: '',
      showFilters: false
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTransactionIcon = (type: string) => {
    if (type === 'credit_purchase') {
      return <CreditCardIcon className="h-6 w-6 text-indigo-600" />
    } else {
      return <DocumentTextIcon className="h-6 w-6 text-purple-600" />
    }
  }

  const getTransactionTitle = (transaction: Transaction) => {
    if (transaction.transaction_type === 'credit_purchase') {
      return `Purchased ${transaction.credit_amount} Credits`
    } else {
      return `Subscribed to ${transaction.plan_type?.charAt(0).toUpperCase()}${transaction.plan_type?.slice(1)} Plan`
    }
  }

  const exportTransactions = () => {
    if (filteredTransactions.length === 0) {
      return
    }

    // Define CSV headers
    const headers = [
      'Transaction ID',
      'Date',
      'Type',
      'Status',
      'Amount',
      'Currency',
      'Payment Gateway',
      'Payment ID',
      'Details'
    ]

    // Convert transactions to CSV rows
    const csvRows = filteredTransactions.map(transaction => {
      const date = format(new Date(transaction.created_at), 'yyyy-MM-dd HH:mm:ss')
      const type = transaction.transaction_type === 'credit_purchase' ? 'Credit Purchase' : 'Plan Subscription'
      const status = transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)
      const details = transaction.transaction_type === 'credit_purchase' 
        ? `${transaction.credit_amount} credits at ₹${transaction.credit_price_per_unit}/credit`
        : `${transaction.plan_type} (${transaction.plan_interval})`

      return [
        transaction.id,
        date,
        type,
        status,
        transaction.amount.toString(),
        transaction.currency,
        transaction.payment_gateway,
        transaction.gateway_payment_id,
        details
      ]
    })

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n')

    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    // Set filename with current date
    const fileName = `transaction_history_${format(new Date(), 'yyyy-MM-dd')}.csv`
    
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Filters */}
      <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <div className="flex items-center">
            <h2 className="text-lg font-medium text-gray-900">Transactions</h2>
            <span className="ml-2 bg-gray-100 text-gray-700 py-0.5 px-2.5 rounded-full text-xs font-medium">
              {filteredTransactions.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search transactions"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setFilters({ ...filters, showFilters: !filters.showFilters })}
            >
              <FunnelIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
              Filters
              {(filters.type !== 'all' || filters.status !== 'all' || filters.dateRange !== 'all') && (
                <span className="ml-1.5 flex h-2 w-2 rounded-full bg-indigo-500"></span>
              )}
            </button>
            
            {(filters.type !== 'all' || filters.status !== 'all' || filters.dateRange !== 'all' || filters.search) && (
              <button
                type="button"
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={resetFilters}
              >
                Reset
              </button>
            )}
          </div>
        </div>
        
        {/* Expanded filters */}
        {filters.showFilters && (
          <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-3 sm:gap-x-6">
            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700">
                Transaction Type
              </label>
              <select
                id="type-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="all">All Types</option>
                <option value="credit_purchase">Credit Purchase</option>
                <option value="plan_subscription">Plan Subscription</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700">
                Date Range
              </label>
              <select
                id="date-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              >
                <option value="all">All Time</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
              </select>
            </div>
          </div>
        )}
      </div>
      
      {/* Summary */}
      <div className="bg-gray-50 px-4 py-3 sm:px-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Amount</p>
            <p className="text-xl font-semibold text-gray-900">₹{totalAmount.toFixed(2)}</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={exportTransactions}
            disabled={filteredTransactions.length === 0}
          >
            <ArrowDownTrayIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </div>
      
      {/* Transaction list */}
      {filteredTransactions.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {filteredTransactions.map((transaction) => (
            <li key={transaction.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {getTransactionIcon(transaction.transaction_type)}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      {getTransactionTitle(transaction)}
                    </h3>
                    <div className="flex items-center mt-1">
                      <p className="text-sm text-gray-500">
                        {format(new Date(transaction.created_at), 'MMM d, yyyy • h:mm a')}
                      </p>
                      <span className="mx-2 text-gray-300">•</span>
                      <p className="text-sm text-gray-500">
                        ID: {transaction.gateway_payment_id.slice(0, 10)}...
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {transaction.status === 'completed' && <CheckIcon className="mr-1 h-3 w-3" />}
                    {transaction.status === 'failed' && <XMarkIcon className="mr-1 h-3 w-3" />}
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                  <p className="ml-4 text-sm font-medium text-gray-900">₹{transaction.amount.toFixed(2)}</p>
                </div>
              </div>
              
              {/* Additional details */}
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  {transaction.transaction_type === 'credit_purchase' && transaction.credit_amount && (
                    <p className="flex items-center text-sm text-gray-500">
                      <span className="mr-1">
                        {transaction.credit_amount} credits at ₹{transaction.credit_price_per_unit}/credit
                      </span>
                    </p>
                  )}
                  {transaction.transaction_type === 'plan_subscription' && transaction.plan_type && (
                    <p className="flex items-center text-sm text-gray-500">
                      <span className="mr-1">
                        {transaction.plan_type.charAt(0).toUpperCase() + transaction.plan_type.slice(1)} Plan ({transaction.plan_interval})
                      </span>
                    </p>
                  )}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <p>
                    {transaction.payment_gateway.charAt(0).toUpperCase() + transaction.payment_gateway.slice(1)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filters.type !== 'all' || filters.status !== 'all' || filters.dateRange !== 'all' || filters.search
              ? 'Try adjusting your filters to find what you\'re looking for.'
              : 'Your transaction history will appear here once you make a purchase.'}
          </p>
          {(filters.type !== 'all' || filters.status !== 'all' || filters.dateRange !== 'all' || filters.search) && (
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={resetFilters}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
