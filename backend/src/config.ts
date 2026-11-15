import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export interface AppConfig {
  port: number;
  host: string;
  databasePath: string;
  aiProvider: 'claude' | 'ollama' | 'gemini' | 'mock';
  anthropicApiKey?: string;
  anthropicModel: string;
  ollamaBaseUrl: string;
  ollamaModel: string;
  geminiApiKey?: string;
  geminiModel: string;
  pinCode: string;
  corsOrigin: string;
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '4000', 10),
  host: process.env.HOST || '0.0.0.0',
  databasePath: process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'study.db'),
  aiProvider: (process.env.AI_PROVIDER as any) || 'mock',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'llama3.2-vision',
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3-flash-preview',
  pinCode: process.env.PIN_CODE || '1234',
  corsOrigin: process.env.CORS_ORIGIN || '*'
};
