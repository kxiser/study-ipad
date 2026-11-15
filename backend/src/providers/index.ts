import { AIProvider } from './types.js';
import { ClaudeProvider } from './claude.provider.js';
import { OllamaProvider } from './ollama.provider.js';
import { GeminiProvider } from './gemini.provider.js';
import { MockProvider } from './mock.provider.js';
import { config } from '../config.js';

export function getAIProvider(): AIProvider {
  const providerType = config.aiProvider?.toLowerCase();

  switch (providerType) {
    case 'claude':
      return new ClaudeProvider();
    case 'ollama':
      return new OllamaProvider();
    case 'gemini':
      return new GeminiProvider();
    case 'mock':
    default:
      if (providerType && providerType !== 'mock') {
        console.warn(`[AIProvider] Proveedor '${providerType}' desconocido. Usando MockProvider de demostración.`);
      }
      return new MockProvider();
  }
}
