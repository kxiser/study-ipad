import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAIProvider } from '../providers/index.js';
import { ImageData } from '../providers/types.js';
import {
  saveExerciseSet,
  getUnitsList,
  getUnitById,
  deleteUnitById,
  getExercisesForReview,
  getReviewCountToday,
  recordExerciseAnswer,
  recordSessionCompletion
} from '../db/database.js';

export async function exerciseRoutes(fastify: FastifyInstance) {
  // Escaneo y procesamiento de páginas de libro
  fastify.post('/api/scan', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const parts = req.parts();
      const images: ImageData[] = [];
      let subjectHint: string | undefined;
      let language: string | undefined;
      let targetUserId = (req.headers['x-user-id'] as string) || 'user-samantha';

      for await (const part of parts) {
        if (part.type === 'file') {
          const buffer = await part.toBuffer();
          images.push({
            buffer,
            mimeType: part.mimetype || 'image/jpeg'
          });
        } else if (part.type === 'field') {
          if (part.fieldname === 'subject') {
            subjectHint = (part.value as string).trim();
          } else if (part.fieldname === 'language') {
            language = (part.value as string).trim();
          } else if (part.fieldname === 'userId') {
            targetUserId = (part.value as string).trim();
          }
        }
      }

      if (images.length === 0) {
        return reply.status(400).send({
          error: 'No se ha subido ninguna imagen. Haz una foto o selecciona una imagen del libro.'
        });
      }

      const provider = getAIProvider();
      req.log.info(`[Scan] Procesando ${images.length} imágenes (materia: ${subjectHint || 'auto'}, idioma: ${language || 'auto'}) con ${provider.name} para usuario ${targetUserId}`);

      const exerciseSet = await provider.generateExercisesFromImages(images, subjectHint, language);
      images.length = 0;

      const unitId = 'unit-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
      saveExerciseSet(unitId, exerciseSet, targetUserId);

      return reply.status(201).send({
        unitId,
        exerciseSet
      });
    } catch (err: any) {
      req.log.error(err, 'Error procesando escaneo');
      return reply.status(500).send({
        error: err.message || 'Error al analizar las páginas con la IA.'
      });
    }
  });

  // Lista de unidades filtrada por usuario
  fastify.get('/api/units', async (req: FastifyRequest<{ Querystring: { userId?: string } }>) => {
    const userId = (req.headers['x-user-id'] as string) || req.query.userId || 'user-samantha';
    return getUnitsList(userId);
  });

  // Detalle de una unidad
  fastify.get('/api/units/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const unit = getUnitById(req.params.id);
    if (!unit) {
      return reply.status(404).send({ error: 'Unidad no encontrada' });
    }
    return unit;
  });

  // Eliminar unidad
  fastify.delete('/api/units/:id', async (req: FastifyRequest<{ Params: { id: string } }>) => {
    deleteUnitById(req.params.id);
    return { success: true };
  });

  // Repaso del día (SRS) filtrado por usuario
  fastify.get('/api/review/today', async (req: FastifyRequest<{ Querystring: { limit?: string; userId?: string } }>) => {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 8;
    const userId = (req.headers['x-user-id'] as string) || req.query.userId || 'user-samantha';
    return getExercisesForReview(limit, userId);
  });

  // Contador de repasos pendientes
  fastify.get('/api/review/count', async (req: FastifyRequest<{ Querystring: { userId?: string } }>) => {
    const userId = (req.headers['x-user-id'] as string) || req.query.userId || 'user-samantha';
    return { count: getReviewCountToday(userId) };
  });

  // Registrar respuesta individual
  fastify.post('/api/exercises/:id/answer', async (
    req: FastifyRequest<{ Params: { id: string }; Body: { isCorrect: boolean } }>,
    reply: FastifyReply
  ) => {
    const { id } = req.params;
    const { isCorrect } = req.body || {};

    if (typeof isCorrect !== 'boolean') {
      return reply.status(400).send({ error: 'El campo isCorrect (boolean) es requerido.' });
    }

    const srsUpdate = recordExerciseAnswer(id, isCorrect);
    return { success: true, srs: srsUpdate };
  });

  // Registrar sesión completada
  fastify.post('/api/sessions/complete', async (
    req: FastifyRequest<{
      Body: {
        userId?: string;
        unitId?: string;
        sessionType: 'new' | 'review';
        durationSeconds: number;
        totalQuestions: number;
        correctAnswers: number;
        starsEarned: number;
      };
    }>,
    reply: FastifyReply
  ) => {
    const body = req.body;
    if (!body || typeof body.correctAnswers !== 'number') {
      return reply.status(400).send({ error: 'Datos de sesión incompletos.' });
    }

    const targetUserId = (req.headers['x-user-id'] as string) || body.userId || 'user-samantha';
    const result = recordSessionCompletion({ ...body, userId: targetUserId });
    return { success: true, ...result };
  });
}
