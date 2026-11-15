import { FastifyInstance } from 'fastify';
import { config } from '../config.js';
import { getAIProvider } from '../providers/index.js';
import { APP_VERSION, APP_BUILD } from '../version.js';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/api/health', async () => {
    let providerName = 'Desconocido';
    try {
      const provider = getAIProvider();
      providerName = provider.name;
    } catch (err: any) {
      providerName = `Error: ${err.message}`;
    }

    return {
      status: 'ok',
      version: APP_VERSION,
      build: APP_BUILD,
      timestamp: new Date().toISOString(),
      provider: config.aiProvider,
      providerName,
      ollamaConfigured: Boolean(config.ollamaBaseUrl),
      claudeConfigured: Boolean(config.anthropicApiKey),
      geminiConfigured: Boolean(config.geminiApiKey)
    };
  });

  fastify.get('/api/version', async () => {
    return {
      version: APP_VERSION,
      build: APP_BUILD,
      timestamp: new Date().toISOString()
    };
  });
}
