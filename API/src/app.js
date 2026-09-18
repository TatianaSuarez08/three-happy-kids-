import express from 'express';
import morgan from 'morgan';
import { corsMiddleware } from './config/cors.js';
import apiRoutes from './routes/index.js';
import { backendAssetsProxy } from './clients/proxy.js';
import {
  createRequestId,
  errorHandler,
  notFoundHandler,
} from './middlewares/security.js';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(corsMiddleware);
  app.use(createRequestId);
  app.use(morgan('combined'));

  app.get('/', (_req, res) => {
    res.json({ success: true, message: 'API Gateway de Three Happy Kids listo' });
  });

  app.use('/assets', backendAssetsProxy);
  app.use('/api/v1', apiRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
