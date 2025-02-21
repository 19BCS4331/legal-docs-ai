import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { generateDocument } from '@/lib/openai/client'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const { prompt, templateId, inputData } = await request.json()

    if (!prompt || !templateId) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = cookieStore.get(name)
            return cookie?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              console.error('Error setting cookie:', error)
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.delete({ name, ...options })
            } catch (error) {
              console.error('Error removing cookie:', error)
            }
          },
        },
      }
    )

    // Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      console.error('Auth error:', authError)
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify user has credits
    const { data: credits, error: creditError } = await supabase
      .from('credits')
      .select('amount')
      .eq('user_id', session.user.id)
      .single()

    if (creditError) {
      console.error('Credit check error:', creditError)
      return new NextResponse('Error checking credits', { status: 500 })
    }

    if (!credits || credits.amount < 1) {
      return new NextResponse('Insufficient credits', { status: 402 })
    }

    // Verify template access
    const { data: template, error: templateError } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (templateError) {
      console.error('Template fetch error:', templateError)
      return new NextResponse('Error fetching template', { status: 500 })
    }

    if (!template) {
      return new NextResponse('Template not found', { status: 404 })
    }

    const { data: subscription, error: subError } =  await supabase
    .from('subscriptions')
    .select('plan_type')
    .eq('user_id', session.user.id)
    .eq('status', 'active')
    .order('subscription_end_date', { ascending: false })
    .limit(1)
    .single()

    if (subError) {
      console.error('Subscription check error:', subError)
      return new NextResponse('Error checking subscription', { status: 500 })
    }

    const userPlan = subscription?.plan_type || 'free'
    if (!template.available_in_plan.includes(userPlan)) {
      return new NextResponse('Template not available in your plan', { status: 403 })
    }

    // Generate document
    const content = await generateDocument(prompt)

    // Deduct credit
    const { error: deductError } = await supabase.rpc('deduct_credit', {
      user_id: session.user.id,
      amount: 1
    })

    if (deductError) {
      console.error('Credit deduction error:', deductError)
      return new NextResponse('Error deducting credits', { status: 500 })
    }

    return NextResponse.json({ content })
  } catch (error: any) {
    console.error('Document generation error:', error)
    return new NextResponse(
      error.message || 'Internal server error', 
      { status: error.status || 500 }
    )
  }
}
