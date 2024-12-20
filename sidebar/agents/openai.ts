import { OpenAI } from 'openai';
import { getApiKey } from '../db';
import { decryptApiKey } from '../encryption';

let client: OpenAI | null = null;

// Create OpenAI Client
export async function createOpenAIClient() {
  const record = await getApiKey();
  if (!record) {
    throw new Error('API key not found.');
  }
  const { key } = record;
  let apiKey = await decryptApiKey(key);
  if (!apiKey) {
    throw new Error('API key not found.');
  }

  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

// Get OpenAI Client (singleton)
export async function getClient(): Promise<OpenAI> {
  return client ? Promise.resolve(client) : (client = await createOpenAIClient());
}
