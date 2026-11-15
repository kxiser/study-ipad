import { buildServer } from './server.js';
import { config } from './config.js';

const server = buildServer();

const start = async () => {
  try {
    await server.listen({
      port: config.port,
      host: config.host
    });
    console.log(`🚀 Servidor backend listo en http://${config.host}:${config.port}`);
    console.log(`🤖 Proveedor de IA configurado: ${config.aiProvider.toUpperCase()}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
