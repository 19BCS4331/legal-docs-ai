import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateDocumentOptions {
  userPlan?: 'free' | 'pro' | 'enterprise';
  stream?: boolean;
}

export async function generateDocument(
  prompt: string,
  systemPrompt: string = 'You are a legal document assistant. Generate clear, professional, and legally sound documents based on the provided information.',
  options: GenerateDocumentOptions = {}
): Promise<string> {
  const { userPlan = 'free', stream = false } = options;

  // Use Puter.js for pro and enterprise users
  if (userPlan === 'pro' || userPlan === 'enterprise') {
    try {
      const model = userPlan === 'enterprise' ? 'claude-3-5-sonnet' : 'claude-3-5-sonnet';
      const messages = [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ];

      if (typeof window !== 'undefined' && (window as any).puter) {
        const puter = (window as any).puter;
        const response = await puter.ai.chat(messages, {
          model,
          stream,
        });

        if (stream) {
          let fullText = '';
          for await (const part of response) {
            fullText += part?.text || '';
          }
          return fullText;
        }

        return response?.text || '';
      }
      
      // Fallback to OpenAI if Puter.js is not available
      console.warn('Puter.js not available, falling back to OpenAI');
    } catch (error) {
      console.error('Puter.js error:', error);
      console.warn('Falling back to OpenAI');
    }
  }

  // Use OpenAI for free users or as fallback
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-0125-preview',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate document. Please try again later.');
  }
}
