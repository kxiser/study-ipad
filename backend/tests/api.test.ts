import { describe, it, expect, beforeAll } from 'vitest';
import { buildServer } from '../src/server.js';
import { FastifyInstance } from 'fastify';

describe('Endpoints de la API Fastify', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildServer();
    await app.ready();
  });

  it('GET /api/health debe responder ok y detalles del proveedor', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/health'
    });
    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.body);
    expect(json.status).toBe('ok');
    expect(json.provider).toBeDefined();
  });

  it('GET /api/units debe listar unidades disponibles', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/units'
    });
    expect(res.statusCode).toBe(200);
    const list = JSON.parse(res.body);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });

  it('POST /api/auth/verify-pin debe validar el PIN por defecto', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/verify-pin',
      payload: { pin: '1234' }
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).valid).toBe(true);

    const badRes = await app.inject({
      method: 'POST',
      url: '/api/auth/verify-pin',
      payload: { pin: '9999' }
    });
    expect(badRes.statusCode).toBe(401);
  });
});
