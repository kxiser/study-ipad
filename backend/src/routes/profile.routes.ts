import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  getUserProfile,
  updateMascot,
  verifyPin,
  updatePin
} from '../db/database.js';

export async function profileRoutes(fastify: FastifyInstance) {
  // Obtener perfil (estrellas, racha, mascota, nombre)
  fastify.get('/api/profile', async () => {
    const profile = getUserProfile();
    // No enviar el PIN directamente al frontend por seguridad
    const { pinCode, ...safeProfile } = profile;
    return safeProfile;
  });

  // Actualizar mascota elegida
  fastify.put('/api/profile/mascot', async (req: FastifyRequest<{ Body: { mascot: string } }>, reply: FastifyReply) => {
    const { mascot } = req.body || {};
    if (!mascot) {
      return reply.status(400).send({ error: 'Mascota no especificada' });
    }
    updateMascot(mascot);
    return { success: true, mascot };
  });

  // Verificar PIN de acceso/ajustes
  fastify.post('/api/auth/verify-pin', async (req: FastifyRequest<{ Body: { pin: string } }>, reply: FastifyReply) => {
    const { pin } = req.body || {};
    if (!pin) {
      return reply.status(400).send({ error: 'PIN requerido' });
    }

    const isValid = verifyPin(pin);
    if (!isValid) {
      return reply.status(401).send({ error: 'PIN incorrecto', valid: false });
    }

    return { valid: true };
  });

  // Cambiar PIN
  fastify.put('/api/auth/change-pin', async (
    req: FastifyRequest<{ Body: { currentPin: string; newPin: string } }>,
    reply: FastifyReply
  ) => {
    const { currentPin, newPin } = req.body || {};
    if (!currentPin || !newPin || newPin.length < 4) {
      return reply.status(400).send({ error: 'El PIN debe tener al menos 4 dígitos.' });
    }

    if (!verifyPin(currentPin)) {
      return reply.status(401).send({ error: 'El PIN actual no es correcto.' });
    }

    updatePin(newPin);
    return { success: true };
  });
}
