import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateDocument(
  prompt: string,
  systemPrompt: string = 'You are a legal document assistant. Generate clear, professional, and legally sound documents based on the provided information.'
): Promise<string> {
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
