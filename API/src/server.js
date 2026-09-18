import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`API Gateway escuchando en http://localhost:${env.PORT}`);
  console.log(`Backend configurado en ${env.BACKEND_URL}`);
  console.log(`Servicio de usuarios configurado en ${env.USERS_SERVICE_URL}`);
});
