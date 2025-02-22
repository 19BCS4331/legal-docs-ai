import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()

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

    // Deduct credit
    const { error: deductError } = await supabase.rpc('deduct_credit', {
      user_id: session.user.id,
      amount: 1
    })

    if (deductError) {
      console.error('Credit deduction error:', deductError)
      return new NextResponse('Error deducting credits', { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Credit deduction error:', error)
    return new NextResponse(
      error.message || 'Internal server error',
      { status: error.status || 500 }
    )
  }
}
