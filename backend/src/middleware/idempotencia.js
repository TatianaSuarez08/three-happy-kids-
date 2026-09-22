import { createHash } from 'node:crypto';
import pool, { ensureIdempotencyTable } from '../db.js';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const WAIT_INTERVAL_MS = 250;
const MAX_WAIT_MS = 20000;

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const getRequestHash = (req) => createHash('sha256')
  .update(JSON.stringify({
    method: req.method,
    path: req.originalUrl,
    body: req.body ?? null,
    authorization: req.headers.authorization ?? null
  }))
  .digest('hex');

const replayResponse = (res, record) => {
  const body = record.response_body || '{}';
  res.status(record.response_status || 200).type('application/json').send(body);
};

const findRecord = async (key) => {
  const [rows] = await pool.execute(
    `SELECT idempotency_key, request_hash, status, response_status, response_body
     FROM api_idempotency WHERE idempotency_key = ?`,
    [key]
  );
  return rows[0];
};

const waitForCompletion = async (key) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < MAX_WAIT_MS) {
    const record = await findRecord(key);
    if (!record || record.status === 'completed') return record;
    await sleep(WAIT_INTERVAL_MS);
  }
  return findRecord(key);
};

export default async function idempotencia(req, res, next) {
  if (!MUTATING_METHODS.has(req.method)) return next();

  const key = req.get('Idempotency-Key');
  if (!key) return next();
  if (key.length > 128) {
    return res.status(400).json({ error: 'Idempotency-Key demasiado largo' });
  }

  try {
    await ensureIdempotencyTable();
    const requestHash = getRequestHash(req);
    const [insertResult] = await pool.execute(
      `INSERT IGNORE INTO api_idempotency
       (idempotency_key, request_hash, status)
       VALUES (?, ?, 'processing')`,
      [key, requestHash]
    );

    if (insertResult.affectedRows === 0) {
      const existing = await waitForCompletion(key);
      if (existing?.request_hash !== requestHash) {
        return res.status(409).json({ error: 'La clave de idempotencia ya pertenece a otra solicitud' });
      }
      if (existing?.status === 'completed') return replayResponse(res, existing);
      return res.status(409).json({ error: 'La solicitud con esta clave sigue en proceso' });
    }

    let responseBody;
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      responseBody = JSON.stringify(body);
      return originalJson(body);
    };
    const originalSend = res.send.bind(res);
    res.send = (body) => {
      if (responseBody === undefined) {
        responseBody = typeof body === 'string' ? body : JSON.stringify(body);
      }
      return originalSend(body);
    };

    res.once('finish', () => {
      if (res.statusCode >= 500) {
        pool.execute('DELETE FROM api_idempotency WHERE idempotency_key = ?', [key]).catch(() => {});
        return;
      }
      pool.execute(
        `UPDATE api_idempotency
         SET status = 'completed', response_status = ?, response_body = ?
         WHERE idempotency_key = ? AND status = 'processing'`,
        [res.statusCode, responseBody || '{}', key]
      ).catch(() => {});
    });

    return next();
  } catch (error) {
    console.error('Error en idempotencia:', error);
    return res.status(503).json({ error: 'No se pudo verificar la solicitud' });
  }
}
