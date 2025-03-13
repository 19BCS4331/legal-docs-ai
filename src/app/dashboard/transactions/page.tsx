import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { TransactionHistory } from '@/components/transactions/TransactionHistory'

export default async function TransactionsPage() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth?redirectTo=/dashboard/transactions')
  }

  // Fetch transactions for the current user
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Transaction History</h1>
        <p className="mt-1 text-sm text-gray-500">
          View your payment history and transaction details
        </p>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 mt-6">
        <TransactionHistory transactions={transactions || []} />
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Transaction History - LegalDocs AI',
  description: 'View your payment history and transaction details',
}
