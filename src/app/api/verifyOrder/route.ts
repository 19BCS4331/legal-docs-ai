import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import crypto from "crypto";
import { createClient } from '@supabase/supabase-js'
import { getDocumentsPerMonth } from '@/utils/plans'

export interface VerifyBody {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    planId: string;
    amount?: number;
};

const SUBSCRIPTION_DURATIONS = {
    'free': 0,
    'pro': 30, // 30 days
    'enterprise': 30 // 30 days
};

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Make sure this is set in your .env.local
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function POST(request: NextRequest) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, amount }: VerifyBody = await request.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: "Missing required parameters", success: false }, { status: 400 })
        }

        const secret = process.env.RAZORPAY_KEY_SECRET as string;
        if (!secret) { 
            return NextResponse.json({ error: "Razorpay secret not found" }, { status: 400 }) 
        }

        // Verify payment signature
        const HMAC = crypto.createHmac("sha256", secret);
        HMAC.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generatedSignature = HMAC.digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return NextResponse.json({ error: "Invalid signature", success: false }, { status: 400 });
        }

        // Get the authenticated user's session
        const cookieStore = await cookies();
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
        );

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "User not authenticated", success: false }, { status: 401 });
        }

        // Get current active subscription if exists
        const { data: currentSubscription } = await supabaseAdmin
            .from('subscriptions')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('status', 'active')
            .single();

        // If there's an active subscription, mark it as inactive
        if (currentSubscription) {
            await supabaseAdmin
                .from('subscriptions')
                .update({ status: 'inactive', updated_at: new Date().toISOString() })
                .eq('id', currentSubscription.id);
        }

        // Calculate subscription end date
        const days = SUBSCRIPTION_DURATIONS[planId as keyof typeof SUBSCRIPTION_DURATIONS] || 30;
        const subscriptionEndDate = new Date();
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + days);

        // Create new subscription
        const { error: subscriptionError } = await supabaseAdmin
            .from('subscriptions')
            .insert({
                user_id: session.user.id,
                plan_type: planId,
                status: 'active',
                razorpay_order_id,
                razorpay_payment_id,
                subscription_start_date: new Date().toISOString(),
                subscription_end_date: subscriptionEndDate.toISOString(),
                updated_at: new Date().toISOString()
            });

        if (subscriptionError) {
            console.error('Error updating subscription:', subscriptionError);
            return NextResponse.json({ error: "Failed to update subscription", success: false }, { status: 500 });
        }

        // Record the transaction in the transactions table
        try {
            const { error: transactionError } = await supabaseAdmin
                .from('transactions')
                .insert({
                    user_id: session.user.id,
                    transaction_type: 'plan_subscription',
                    plan_type: planId,
                    plan_interval: 'monthly', // Assuming monthly interval
                    amount: amount, // Use the amount from the request
                    currency: 'INR',
                    status: 'completed',
                    payment_gateway: 'razorpay',
                    gateway_order_id: razorpay_order_id,
                    gateway_payment_id: razorpay_payment_id,
                    gateway_signature: razorpay_signature,
                    created_at: new Date().toISOString()
                });

            if (transactionError) {
                console.error('Error recording subscription transaction:', transactionError);
                // Continue with the process even if transaction recording fails
            }
        } catch (err) {
            console.error('Failed to record subscription transaction:', err);
            // Continue with the process even if transaction recording fails
        }

        // Get the credits to add based on the plan
        const creditsToAdd = getDocumentsPerMonth(planId);
        
        // Check if user already has credits
        const { data: existingCredits } = await supabaseAdmin
            .from('credits')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

        if (existingCredits) {
            // Update existing credits
            const { error: creditsError } = await supabaseAdmin
                .from('credits')
                .update({ 
                    amount: existingCredits.amount + creditsToAdd,
                    updated_at: new Date().toISOString() 
                })
                .eq('user_id', session.user.id);

            if (creditsError) {
                console.error('Error updating credits:', creditsError);
                // Don't return error here, as subscription was already updated
            }
        } else {
            // Insert new credits record
            const { error: creditsError } = await supabaseAdmin
                .from('credits')
                .insert({
                    user_id: session.user.id,
                    amount: creditsToAdd,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (creditsError) {
                console.error('Error adding credits:', creditsError);
                // Don't return error here, as subscription was already updated
            }
        }

        return NextResponse.json({ 
            message: "Payment verified, subscription and credits updated successfully", 
            success: true 
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        return NextResponse.json({ error: "An error occurred", success: false }, { status: 500 })
    }
}
