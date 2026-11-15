import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  getAllUsers,
  getUserById,
  createChildUser,
  createOrUpdateGoogleUser
} from '../db/database.js';

// Decodificador seguro de JWT payload de Google OAuth (formato standard id_token)
function decodeGoogleJwt(token: string): { sub: string; email: string; name: string; picture?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64').toString('utf8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export async function authRoutes(fastify: FastifyInstance) {
  // Lista de usuarios (perfiles de niños / padres)
  fastify.get('/api/users', async () => {
    return getAllUsers();
  });

  // Crear nuevo perfil de niño
  fastify.post('/api/users', async (req: FastifyRequest<{ Body: { name: string; avatar?: string; pin?: string } }>, reply: FastifyReply) => {
    const { name, avatar, pin } = req.body || {};
    if (!name || name.trim().length < 2) {
      return reply.status(400).send({ error: 'El nombre debe tener al menos 2 letras.' });
    }
    const user = createChildUser(name.trim(), avatar || 'chispa', pin || '1234');
    return reply.status(201).send(user);
  });

  // Autenticación con Google OAuth (Gratis oficial de Google)
  fastify.post('/api/auth/google', async (req: FastifyRequest<{ Body: { credential: string } }>, reply: FastifyReply) => {
    const { credential } = req.body || {};
    if (!credential) {
      return reply.status(400).send({ error: 'Credencial de Google requerida' });
    }

    const payload = decodeGoogleJwt(credential);
    if (!payload || !payload.email) {
      return reply.status(400).send({ error: 'Token de Google inválido' });
    }

    const user = createOrUpdateGoogleUser({
      googleId: payload.sub,
      name: payload.name || payload.email.split('@')[0],
      email: payload.email,
      avatar: 'chispa'
    });

    return {
      success: true,
      user
    };
  });
}
