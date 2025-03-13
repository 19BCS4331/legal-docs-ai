-- Migration: Create credit_transactions table
-- Description: This table tracks all credit purchase transactions

-- Create the credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount > 0),
    price_per_unit DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    razorpay_order_id TEXT NOT NULL,
    razorpay_payment_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Add a unique constraint on razorpay_payment_id to prevent duplicate transactions
    CONSTRAINT unique_razorpay_payment UNIQUE (razorpay_payment_id)
);

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS credit_transactions_user_id_idx ON credit_transactions(user_id);

-- Create an index on created_at for chronological queries
CREATE INDEX IF NOT EXISTS credit_transactions_created_at_idx ON credit_transactions(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own transactions
CREATE POLICY "Users can view their own transactions"
ON credit_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Only service role can insert new transactions
CREATE POLICY "Only service role can insert transactions"
ON credit_transactions
FOR INSERT
WITH CHECK (false); -- Restrict direct inserts, only allow through service role

-- Grant permissions to service role if you have one
-- GRANT ALL ON credit_transactions TO service_role;

-- Add comment to table
COMMENT ON TABLE credit_transactions IS 'Records of credit purchases made by users';
