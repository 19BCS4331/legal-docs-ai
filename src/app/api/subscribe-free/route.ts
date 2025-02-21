import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

export async function POST() {
    try {
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
            return new NextResponse('Unauthorized', { status: 401 })
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

        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        // Create new subscription for free plan
        const { error: subscriptionError } = await supabaseAdmin
            .from('subscriptions')
            .insert({
                user_id: session.user.id,
                plan_type: 'free',
                status: 'active',
                subscription_start_date: now.toISOString(),
                subscription_end_date: thirtyDaysFromNow.toISOString(),
                updated_at: now.toISOString()
            })

        if (subscriptionError) {
            console.error('Error updating subscription:', subscriptionError)
            return new NextResponse('Failed to update subscription', { status: 500 })
        }

        return NextResponse.json({ 
            message: "Successfully subscribed to free plan",
            success: true 
        })
    } catch (error) {
        console.error('Free subscription error:', error)
        return new NextResponse('Server error', { status: 500 })
    }
}
