import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateDocument = async (
  documentType: string,
  userInputs: Record<string, string>
) => {
  try {
    const prompt = createPrompt(documentType, userInputs);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a legal document expert. Generate professional and accurate legal documents based on the provided information."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating document:', error);
    throw error;
  }
};

const createPrompt = (documentType: string, userInputs: Record<string, string>) => {
  const inputsText = Object.entries(userInputs)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  return `
    Please generate a professional ${documentType} with the following information:
    
    ${inputsText}
    
    Please ensure the document:
    1. Uses formal legal language
    2. Includes all necessary clauses and sections
    3. Is properly formatted
    4. Includes any required disclaimers
    5. Is compliant with standard legal practices
  `;
};
