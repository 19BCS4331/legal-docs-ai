import { createBrowserClient } from '@supabase/ssr'

interface MemoizedAIContent {
  content: string
  createdAt: string
  expiresAt: string
  prompt: string
  model: string
  type: 'summary' | 'risk_analysis' | 'document_generation'
  documentId: string
  hash: string
}

export async function getMemoizedContent(
  prompt: string,
  model: string,
  type: MemoizedAIContent['type'],
  documentId: string
): Promise<string | null> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Create a hash of the prompt and model to use as a unique identifier
  const hash = await createHash(prompt + model)

  // Check if we have a valid cached response
  const { data, error } = await supabase
    .from('ai_memoization')
    .select('*')
    .eq('hash', hash)
    .eq('document_id', documentId)
    .eq('type', type)
    .single()

  if (error || !data) return null

  // Check if the content has expired
  if (new Date(data.expires_at) < new Date()) {
    // Delete expired content
    await supabase.from('ai_memoization').delete().eq('hash', hash)
    return null
  }

  return data.content
}

export async function saveMemoizedContent(
  content: string,
  prompt: string,
  model: string,
  type: MemoizedAIContent['type'],
  documentId: string,
  expirationHours: number = 24
): Promise<void> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const hash = await createHash(prompt + model)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + expirationHours * 60 * 60 * 1000)

  await supabase.from('ai_memoization').upsert({
    hash,
    content,
    prompt,
    model,
    type,
    document_id: documentId,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  })
}

// Helper function to create a hash of the input string
async function createHash(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
