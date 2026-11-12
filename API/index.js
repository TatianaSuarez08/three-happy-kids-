import express from 'express'; // Importa el framework Express para crear el servidor
import cors from 'cors'; // Importa middleware para habilitar CORS (peticiones entre orígenes)
import morgan from 'morgan'; // Importa logger HTTP para desarrollo

import { env } from './src/config/env.js';
import { createBackendProxy } from './src/proxy.js';

const app = express(); // Crea la instancia de la aplicación Express

const PORT = env.PORT; // Define el puerto desde la configuración validada
const proxyToBackend = createBackendProxy(env.BACKEND_URL);

// Configurar CORS para permitir credenciales desde localhost en desarrollo
const corsOptions = {
  origin: env.CORS_ORIGIN,
  credentials: true, // Permitir cookies y credenciales
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key']
};

app.use(cors(corsOptions)); // Activa CORS con opciones configuradas
app.use(morgan('dev')); // Activa el logger en modo 'dev' para ver peticiones en consola
app.use(proxyToBackend);

app.listen(PORT, () => {
  console.log(`API proxy escuchando en http://localhost:${PORT}`);
  console.log(`Reenviando solicitudes a ${env.BACKEND_URL}`);
});
