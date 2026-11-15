import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fs from 'fs';
import path from 'path';
import { config } from './config.js';
import { exerciseRoutes } from './routes/exercises.routes.js';
import { profileRoutes } from './routes/profile.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { encyclopediaRoutes } from './routes/encyclopedia.routes.js';

export function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'test' ? 'silent' : 'info'
    }
  });

  // CORS
  fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  });

  // Multipart para recepción de imágenes (hasta 25MB por archivo para cámaras de iPad)
  fastify.register(multipart, {
    limits: {
      fileSize: 25 * 1024 * 1024,
      files: 5
    }
  });

  // Registrar rutas API
  fastify.register(healthRoutes);
  fastify.register(authRoutes);
  fastify.register(exerciseRoutes);
  fastify.register(profileRoutes);
  fastify.register(encyclopediaRoutes);

  // Servir frontend compilado estático si existe (para producción en Cloud Run / Docker único)
  const candidateStaticDirs = [
    process.env.STATIC_DIR,
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), '../frontend/dist'),
    path.join(process.cwd(), 'dist/public')
  ].filter(Boolean) as string[];

  const staticDir = candidateStaticDirs.find(d => fs.existsSync(d) && fs.existsSync(path.join(d, 'index.html')));

  if (staticDir) {
    fastify.register(fastifyStatic, {
      root: staticDir,
      prefix: '/',
      decorateReply: true,
      wildcard: false
    });

    fastify.setNotFoundHandler((req, reply) => {
      if (req.raw.url && req.raw.url.startsWith('/api')) {
        return reply.status(404).send({ error: 'Endpoint de API no encontrado' });
      }
      return reply.sendFile('index.html');
    });
  }

  return fastify;
}
