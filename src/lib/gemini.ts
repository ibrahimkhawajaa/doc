import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';

const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
  'gemini-pro',
];

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  if (!client) client = new GoogleGenerativeAI(apiKey);
  return client;
}

export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

async function tryGenerate(
  model: GenerativeModel,
  content: string | Parameters<GenerativeModel['generateContent']>[0]
): Promise<string> {
  const result = await model.generateContent(content);
  const text = result.response.text();
  if (!text?.trim()) throw new Error('Empty Gemini response');
  return text.trim();
}

export async function generateText(prompt: string): Promise<{ text: string; model: string }> {
  const genAI = getClient();
  if (!genAI) throw new Error('GEMINI_API_KEY not configured');

  let lastError: unknown;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const text = await tryGenerate(model, prompt);
      return { text, model: modelName };
    } catch (error) {
      lastError = error;
      console.error(`Gemini model ${modelName} failed:`, error);
    }
  }

  throw lastError ?? new Error('All Gemini models failed');
}

export async function generateMultimodal(
  parts: Parameters<GenerativeModel['generateContent']>[0]
): Promise<{ text: string; model: string }> {
  const genAI = getClient();
  if (!genAI) throw new Error('GEMINI_API_KEY not configured');

  let lastError: unknown;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const text = await tryGenerate(model, parts);
      return { text, model: modelName };
    } catch (error) {
      lastError = error;
      console.error(`Gemini multimodal ${modelName} failed:`, error);
    }
  }

  throw lastError ?? new Error('All Gemini models failed');
}
