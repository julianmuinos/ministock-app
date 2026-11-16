import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createHttpClient, executeRequest } from '../src/services/httpClient.js';

let server;
let baseUrl;

function readJson(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

before(async () => {
  server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'POST' && req.url === '/api/auth/login') {
      const body = await readJson(req);
      if (body.email === 'test@mern.dev' && body.password === 'secret123') {
        res.writeHead(200);
        res.end(JSON.stringify({ token: 'jwt-demo-token' }));
        return;
      }
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Credenciales inválidas' }));
      return;
    }

    if (req.url === '/api/productos') {
      if (req.headers.authorization !== 'Bearer jwt-demo-token') {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Token requerido' }));
        return;
      }

      if (req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify([{ id: 1, name: 'Monitor' }]));
        return;
      }

      if (req.method === 'POST') {
        const body = await readJson(req);
        res.writeHead(201);
        res.end(JSON.stringify({ id: 2, ...body }));
        return;
      }
    }

    if (req.url === '/api/boom') {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Fallo simulado' }));
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'No encontrado' }));
  });

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

describe('httpClient integración', () => {
  it('autentica, adjunta Bearer token automáticamente y mide milisegundos', async () => {
    let token = null;
    const client = createHttpClient({
      getBaseUrl: () => baseUrl,
      getToken: () => token
    });

    // Sin token -> 401
    const unauthRes = await executeRequest(client, { method: 'GET', path: '/productos' });
    assert.equal(unauthRes.status, 401);
    assert.equal(unauthRes.ok, false);
    assert.equal(typeof unauthRes.durationMs, 'number');

    // Login -> captura token
    const loginRes = await executeRequest(client, {
      method: 'POST',
      path: '/auth/login',
      data: { email: 'test@mern.dev', password: 'secret123' }
    });
    assert.equal(loginRes.status, 200);
    assert.equal(loginRes.ok, true);
    token = loginRes.data.token;

    // Petición protegida con Bearer automático
    const listRes = await executeRequest(client, { method: 'GET', path: 'productos' });
    assert.equal(listRes.status, 200);
    assert.deepEqual(listRes.data, [{ id: 1, name: 'Monitor' }]);

    // POST con JSON body
    const createRes = await executeRequest(client, {
      method: 'POST',
      path: '/productos',
      data: { name: 'Webcam' }
    });
    assert.equal(createRes.status, 201);
    assert.equal(createRes.data.name, 'Webcam');

    // 500 Internal Server Error
    const errRes = await executeRequest(client, { method: 'GET', path: '/boom' });
    assert.equal(errRes.status, 500);
    assert.equal(errRes.ok, false);
  });

  it('captura errores de red sin lanzar excepción no controlada', async () => {
    const deadClient = createHttpClient({
      getBaseUrl: () => 'http://127.0.0.1:1/api',
      getToken: () => null,
      timeout: 1500
    });

    const res = await executeRequest(deadClient, { method: 'GET', path: '/health' });
    assert.equal(res.status, null);
    assert.ok(res.networkError);
  });
});
