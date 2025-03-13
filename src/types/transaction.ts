export interface Transaction {
  id: string
  user_id: string
  transaction_type: 'credit_purchase' | 'plan_subscription'
  credit_amount?: number
  credit_price_per_unit?: number
  plan_type?: string
  plan_interval?: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_gateway: string
  gateway_order_id: string
  gateway_payment_id: string
  source?: string
  created_at: string
  updated_at?: string
}
