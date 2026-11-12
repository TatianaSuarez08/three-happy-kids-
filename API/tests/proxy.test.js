import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createBackendProxy } from '../src/proxy.js';

const listen = (server) => new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => resolve(server.address().port));
});

const close = (server) => new Promise((resolve, reject) => {
  server.close((error) => (error ? reject(error) : resolve()));
});

test('proxy reenvía método, ruta, query, autenticación, clave y cuerpo al backend', async (t) => {
  let receivedRequest;
  const backend = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      receivedRequest = {
        method: req.method,
        url: req.url,
        authorization: req.headers.authorization,
        idempotencyKey: req.headers['idempotency-key'],
        body: Buffer.concat(chunks).toString()
      };
      res.writeHead(201, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ received: true }));
    });
  });
  const backendPort = await listen(backend);
  const proxy = http.createServer(createBackendProxy(`http://127.0.0.1:${backendPort}`));
  const proxyPort = await listen(proxy);

  t.after(async () => {
    await close(proxy);
    await close(backend);
  });

  const response = await fetch(`http://127.0.0.1:${proxyPort}/api/v1/pedidos?estado=Pendiente`, {
    method: 'POST',
    headers: {
      authorization: 'Bearer test-token',
      'content-type': 'application/json',
      'idempotency-key': 'postman-test-key'
    },
    body: '{"productos":[{"id":7,"cantidad":1}]}'
  });

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { received: true });
  assert.deepEqual(receivedRequest, {
    method: 'POST',
    url: '/api/v1/pedidos?estado=Pendiente',
    authorization: 'Bearer test-token',
    idempotencyKey: 'postman-test-key',
    body: '{"productos":[{"id":7,"cantidad":1}]}'
  });
});
