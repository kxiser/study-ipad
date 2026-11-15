import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  getUserProfile,
  updateMascot,
  verifyPin,
  updatePin
} from '../db/database.js';

export async function profileRoutes(fastify: FastifyInstance) {
  // Obtener perfil del estudiante
  fastify.get('/api/profile', async (req: FastifyRequest<{ Querystring: { userId?: string } }>) => {
    const userId = (req.headers['x-user-id'] as string) || req.query.userId || 'user-samantha';
    const profile = getUserProfile(userId);
    const { pinCode, ...safeProfile } = profile;
    return safeProfile;
  });

  // Actualizar mascota elegida
  fastify.put('/api/profile/mascot', async (req: FastifyRequest<{ Body: { mascot: string; userId?: string } }>, reply: FastifyReply) => {
    const { mascot, userId } = req.body || {};
    if (!mascot) {
      return reply.status(400).send({ error: 'Mascota no especificada' });
    }
    const targetUserId = (req.headers['x-user-id'] as string) || userId || 'user-samantha';
    updateMascot(mascot, targetUserId);
    return { success: true, mascot };
  });

  // Verificar PIN de acceso/ajustes
  fastify.post('/api/auth/verify-pin', async (req: FastifyRequest<{ Body: { pin: string; userId?: string } }>, reply: FastifyReply) => {
    const { pin, userId } = req.body || {};
    if (!pin) {
      return reply.status(400).send({ error: 'PIN requerido' });
    }
    const targetUserId = (req.headers['x-user-id'] as string) || userId || 'user-samantha';
    const isValid = verifyPin(pin, targetUserId);
    if (!isValid) {
      return reply.status(401).send({ error: 'PIN incorrecto', valid: false });
    }
    return { valid: true };
  });

  // Cambiar PIN
  fastify.put('/api/auth/change-pin', async (
    req: FastifyRequest<{ Body: { currentPin: string; newPin: string; userId?: string } }>,
    reply: FastifyReply
  ) => {
    const { currentPin, newPin, userId } = req.body || {};
    if (!currentPin || !newPin || newPin.length < 4) {
      return reply.status(400).send({ error: 'El PIN debe tener al menos 4 dígitos.' });
    }
    const targetUserId = (req.headers['x-user-id'] as string) || userId || 'user-samantha';

    if (!verifyPin(currentPin, targetUserId)) {
      return reply.status(401).send({ error: 'El PIN actual no es correcto.' });
    }

    updatePin(newPin, targetUserId);
    return { success: true };
  });
}
