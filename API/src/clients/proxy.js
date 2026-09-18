import { createProxyMiddleware } from 'http-proxy-middleware';
import { env } from '../config/env.js';
import { addInternalServiceHeader } from '../middlewares/security.js';

const createServiceProxy = (target, pathRewrite) => createProxyMiddleware({
  target,
  changeOrigin: true,
  pathRewrite,
  proxyTimeout: env.PROXY_TIMEOUT_MS,
  timeout: env.PROXY_TIMEOUT_MS,
  on: {
    proxyReq: addInternalServiceHeader,
    error: (_error, _req, res) => {
      if (!res.headersSent) {
        res.status(502).json({ error: 'El servicio solicitado no está disponible.' });
      }
    },
  },
});

export const usersProxy = createServiceProxy(
  env.USERS_SERVICE_URL,
  (path) => `/api/v1${path}`,
);

export const usersServiceProxy = createServiceProxy(
  env.USERS_SERVICE_URL,
  (path) => `/api/v1/users${path}`,
);

export const backendProxy = createServiceProxy(
  env.BACKEND_URL,
  (path) => `/api/v1${path}`,
);

export const backendAssetsProxy = createServiceProxy(
  env.BACKEND_URL,
  (path) => `/assets${path}`,
);
