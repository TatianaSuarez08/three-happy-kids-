import express from 'express'; // Importa el framework Express para crear el servidor
import cors from 'cors'; // Importa middleware para habilitar CORS (peticiones entre orígenes)
import morgan from 'morgan'; // Importa logger HTTP para desarrollo

import { verifyDatabaseConnection } from './src/db.js';
import userRoutes from './src/routes/UsuarioRoute.js'; // Importa las rutas relacionadas con usuarios
import productRoutes from './src/routes/ProductoRoute.js'; // Importa las rutas relacionadas con productos
import orderRoutes from './src/routes/PedidoRoute.js';
import adminUserRoutes from './src/routes/AdminUsuarioRoute.js';
import dashboardRoutes from './src/routes/DashboardRoute.js';
import catalogRoutes from './src/routes/CatalogoRoute.js';
import inventarioRoutes from './src/routes/InventarioRoute.js';
import logisticaRoutes from './src/routes/LogisticaRoute.js';
import healthRoutes from './src/routes/HealthRoute.js';
import { productImagesDirectory, profileImagesDirectory } from './src/middleware/subidaImagen.js';
import { env } from './src/config/env.js';

const app = express(); // Crea la instancia de la aplicación Express

const PORT = env.PORT; // Define el puerto desde la configuración validada

// Configurar CORS para permitir credenciales desde localhost en desarrollo
const corsOptions = {
    origin: env.CORS_ORIGIN, // Origen permitido (ajusta en producción)
  credentials: true, // Permitir cookies y credenciales
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions)); // Activa CORS con opciones configuradas
app.use(express.json()); // Middleware para parsear bodies en formato JSON
app.use(express.urlencoded({ extended: true })); // Middleware para parsear bodies URL-encoded (formularios)
app.use(morgan('dev')); // Activa el logger en modo 'dev' para ver peticiones en consola
app.use('/assets/productos', express.static(productImagesDirectory));
app.use('/assets/foto_de_perfil', express.static(profileImagesDirectory));

// Ruta raíz: responde con un JSON indicando que la API está lista
app.get('/', (req, res) => {
    // `req` es el objeto de petición y `res` el de respuesta
    res.json({
        success: true, // Campo que indica éxito de la respuesta
        message: 'API de Express con MySQL lista' // Mensaje de estado para quien consuma la API
    });
});

// API versionada; la capa pública real del sistema se mantiene bajo /api/v1.
app.use('/api/v1', userRoutes);
app.use('/api/v1', productRoutes);
app.use('/api/v1', orderRoutes);
app.use('/api/v1', adminUserRoutes);
app.use('/api/v1', dashboardRoutes);
app.use('/api/v1', catalogRoutes);
app.use('/api/v1', inventarioRoutes);
app.use('/api/v1', logisticaRoutes);
app.use('/api/v1', healthRoutes);

// Inicia el servidor escuchando en el puerto configurado
const server = app.listen(PORT, async () => {
    try {
        await verifyDatabaseConnection();
        console.log(`Servidor escuchando en http://localhost:${PORT}`);
        console.log(`Base de datos conectada: ${env.DB_HOST}/${env.DB_DATABASE}`);
    } catch (error) {
        console.error(`No se pudo conectar a MySQL en ${env.DB_HOST}/${env.DB_DATABASE}. Revisa Back-end/.env.`, error.message);
        server.close(() => process.exitCode = 1);
    }
});

