/**
 * Groq AI Client
 *
 * Configures the Groq SDK using the centralized configuration.
 */
import Groq from 'groq-sdk';
import { config } from '@/lib/config';

const env = config();

const globalForGroq = global as unknown as { groq: Groq };

// Only instantiate if the API key is present
export const groq =
  globalForGroq.groq ||
  (env.GROQ_API_KEY
    ? new Groq({ apiKey: env.GROQ_API_KEY })
    : (null as unknown as Groq)); // Fallback planner handles this

if (process.env.NODE_ENV !== 'production' && groq) {
  globalForGroq.groq = groq;
}

export const getGroqClient = () => {
  if (!groq) {
    throw new Error('Groq API Key is missing. Check your environment variables.');
  }
  return groq;
};
