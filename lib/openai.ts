import OpenAI from 'openai';

let cached: OpenAI | null | undefined;

export function openaiClient(): OpenAI | null {
  if (cached !== undefined) return cached;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    cached = null;
    return cached;
  }

  cached = new OpenAI({ apiKey });
  return cached;
}
