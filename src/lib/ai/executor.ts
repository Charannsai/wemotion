/**
 * AI Executor
 *
 * Calls the Groq API and parses the response against the expected Zod schema.
 */
import { getGroqClient } from './client';
import { aiDocumentSchema, type AiDocumentPlanSchema } from './schema';
import { PLANNER_SYSTEM_PROMPT, buildUserPrompt } from './prompts';
import { config } from '@/lib/config';

const env = config();

export async function generateDocumentPlan(
  brief: string,
  contextChunks: string[],
  targetFormat: 'horizontal' | 'vertical' | 'square'
): Promise<AiDocumentPlanSchema> {
  const groq = getGroqClient();
  const userPrompt = buildUserPrompt(brief, contextChunks, targetFormat);

  const completion = await groq.chat.completions.create({
    model: env.GROQ_PLANNER_MODEL,
    messages: [
      { role: 'system', content: PLANNER_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ],
    // Force structured JSON output
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 8000,
  });

  const rawJson = completion.choices[0]?.message?.content;
  if (!rawJson) {
    throw new Error('LLM returned empty content.');
  }

  try {
    const parsed = JSON.parse(rawJson);
    // Validate against our Zod schema
    const validated = aiDocumentSchema.parse(parsed);
    return validated;
  } catch (err) {
    console.error('Failed to parse or validate LLM output:', rawJson);
    throw new Error(`LLM output validation failed: ${(err as Error).message}`);
  }
}
