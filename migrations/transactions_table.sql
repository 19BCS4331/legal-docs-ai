-- Migration: Create transactions table
-- Description: This table tracks all financial transactions including credit purchases and plan subscriptions

-- Create the transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Transaction type and source
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit_purchase', 'plan_subscription')),
    
    -- Credit purchase specific fields
    credit_amount INTEGER,
    credit_price_per_unit DECIMAL(10, 2),
    
    -- Plan subscription specific fields
    plan_type TEXT, -- 'free', 'pro', 'enterprise'
    plan_interval TEXT, -- 'monthly', 'yearly'
    
    -- Common fields
    amount DECIMAL(10, 2) NOT NULL, -- Total transaction amount
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    
    -- Payment gateway details
    payment_gateway TEXT NOT NULL DEFAULT 'razorpay',
    gateway_order_id TEXT,
    gateway_payment_id TEXT,
    gateway_signature TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Add constraints
    CONSTRAINT valid_credit_purchase CHECK (
        (transaction_type = 'credit_purchase' AND credit_amount IS NOT NULL AND credit_price_per_unit IS NOT NULL) OR
        transaction_type != 'credit_purchase'
    ),
    CONSTRAINT valid_plan_subscription CHECK (
        (transaction_type = 'plan_subscription' AND plan_type IS NOT NULL) OR
        transaction_type != 'plan_subscription'
    ),
    CONSTRAINT unique_gateway_payment UNIQUE (gateway_payment_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON transactions(created_at);
CREATE INDEX IF NOT EXISTS transactions_transaction_type_idx ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON transactions(status);

-- Add RLS (Row Level Security) policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own transactions
CREATE POLICY "Users can view their own transactions"
ON transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Only service role can insert/update/delete transactions
CREATE POLICY "Only service role can modify transactions"
ON transactions
USING (false);

-- Add comment to table
COMMENT ON TABLE transactions IS 'Records of all financial transactions including credit purchases and plan subscriptions';

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at timestamp
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
