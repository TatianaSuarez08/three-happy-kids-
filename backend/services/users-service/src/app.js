import express from 'express';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json());
  app.use(morgan('combined'));
  app.get('/', (_req, res) => {
    res.json({ success: true, message: 'Users Service listo' });
  });
  app.use('/api/v1/users', userRoutes);
  app.use((_req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada.' });
  });

  return app;
};
