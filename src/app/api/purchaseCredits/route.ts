import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import crypto from "crypto";
import { createClient } from '@supabase/supabase-js'
import { CREDIT_PRICE_PER_UNIT } from '@/utils/plans'

export interface PurchaseCreditsBody {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    creditAmount: number;
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
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, creditAmount }: PurchaseCreditsBody = await request.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !creditAmount) {
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

        // Update the transaction recording to use the new transactions table
        try {
            const { error: transactionError } = await supabaseAdmin
                .from('transactions')
                .insert({
                    user_id: session.user.id,
                    transaction_type: 'credit_purchase',
                    credit_amount: creditAmount,
                    credit_price_per_unit: CREDIT_PRICE_PER_UNIT,
                    amount: creditAmount * CREDIT_PRICE_PER_UNIT,
                    currency: 'INR',
                    status: 'completed',
                    payment_gateway: 'razorpay',
                    gateway_order_id: razorpay_order_id,
                    gateway_payment_id: razorpay_payment_id,
                    gateway_signature: razorpay_signature,
                    created_at: new Date().toISOString()
                });

            if (transactionError) {
                console.error('Error recording transaction:', transactionError);
                // Continue with the process even if transaction recording fails
            }
        } catch (err) {
            console.error('Failed to record transaction:', err);
            // Continue with the process even if transaction recording fails
        }

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
                    amount: existingCredits.amount + creditAmount,
                    updated_at: new Date().toISOString() 
                })
                .eq('user_id', session.user.id);

            if (creditsError) {
                console.error('Error updating credits:', creditsError);
                return NextResponse.json({ error: "Failed to update credits", success: false }, { status: 500 });
            }
        } else {
            // Insert new credits record
            const { error: creditsError } = await supabaseAdmin
                .from('credits')
                .insert({
                    user_id: session.user.id,
                    amount: creditAmount,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (creditsError) {
                console.error('Error adding credits:', creditsError);
                return NextResponse.json({ error: "Failed to add credits", success: false }, { status: 500 });
            }
        }

        return NextResponse.json({ 
            message: "Payment verified and credits added successfully", 
            success: true,
            creditsAdded: creditAmount
        });
    } catch (error) {
        console.error('Credit purchase error:', error);
        return NextResponse.json({ error: "An error occurred", success: false }, { status: 500 })
    }
}
