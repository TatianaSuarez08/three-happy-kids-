import http from 'node:http';
import https from 'node:https';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade'
]);

const getForwardedHeaders = (headers) => {
  const connectionHeaders = new Set(
    String(headers.connection || '')
      .split(',')
      .map((header) => header.trim().toLowerCase())
      .filter(Boolean)
  );

  return Object.fromEntries(
    Object.entries(headers).filter(([name]) => (
      !HOP_BY_HOP_HEADERS.has(name.toLowerCase())
      && !connectionHeaders.has(name.toLowerCase())
    ))
  );
};

export const createBackendProxy = (backendUrl) => {
  const backend = new URL(backendUrl);
  if (!['http:', 'https:'].includes(backend.protocol)) {
    throw new TypeError('API_BACKEND_URL debe usar http o https');
  }

  const transport = backend.protocol === 'https:' ? https : http;

  return (req, res) => {
    const requestUrl = new URL(req.originalUrl || req.url, backend);
    const headers = getForwardedHeaders(req.headers);
    headers.host = backend.host;

    const backendRequest = transport.request({
      hostname: backend.hostname,
      port: backend.port || undefined,
      method: req.method,
      path: `${requestUrl.pathname}${requestUrl.search}`,
      headers
    }, (backendResponse) => {
      res.writeHead(
        backendResponse.statusCode || 502,
        getForwardedHeaders(backendResponse.headers)
      );
      backendResponse.on('error', (error) => res.destroy(error));
      backendResponse.pipe(res);
    });

    backendRequest.on('error', (error) => {
      if (req.aborted) return;
      console.error(`Error al comunicarse con el backend en ${requestUrl.pathname}:`, error.message);
      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          error: 'No fue posible comunicarse con el backend'
        });
      } else {
        res.destroy(error);
      }
    });

    req.on('aborted', () => backendRequest.destroy());
    res.on('close', () => {
      if (!res.writableEnded) backendRequest.destroy();
    });
    req.pipe(backendRequest);
  };
};
