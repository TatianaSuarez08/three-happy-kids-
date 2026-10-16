import express from 'express'; // Importa el framework Express para crear el servidor
import cors from 'cors'; // Importa middleware para habilitar CORS (peticiones entre orígenes)
import morgan from 'morgan'; // Importa logger HTTP para desarrollo

import './src/db.js'; // Ejecuta la inicialización de la base de datos (conexión a MySQL)
import userRoutes from './src/routes/UsuarioRoute.js'; // Importa las rutas relacionadas con usuarios
import productRoutes from './src/routes/ProductoRoute.js'; // Importa las rutas relacionadas con productos
import orderRoutes from './src/routes/PedidoRoute.js';
import adminUserRoutes from './src/routes/AdminUsuarioRoute.js';
import dashboardRoutes from './src/routes/DashboardRoute.js';
import catalogRoutes from './src/routes/CatalogoRoute.js';
import inventarioRoutes from './src/routes/InventarioRoute.js';
import logisticaRoutes from './src/routes/LogisticaRoute.js';
import { productImagesDirectory, profileImagesDirectory } from './src/middleware/subidaImagen.js';

if (!process.env.JWT_SECRET?.trim()) {
    throw new Error('JWT_SECRET debe configurarse antes de iniciar el backend');
}

const app = express(); // Crea la instancia de la aplicación Express

const PORT = Number(process.env.BACKEND_PORT || process.env.PORT || 3002); // Puerto interno del backend
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const isLocalDevelopmentOrigin = (origin) => {
    if (process.env.NODE_ENV === 'production') {
        return false;
    }

    try {
        const url = new URL(origin);
        return url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    } catch {
        return false;
    }
};

// Configurar CORS para permitir credenciales desde orígenes explícitos.
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error('Origen no permitido por CORS'));
    },
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

// Monta las rutas de usuario en la ruta base '/'
app.use('/', userRoutes);
app.use('/', productRoutes);
app.use('/', orderRoutes);
app.use('/', adminUserRoutes);
app.use('/', dashboardRoutes);
app.use('/', catalogRoutes);
app.use('/', inventarioRoutes);
app.use('/', logisticaRoutes);

// Inicia el servidor escuchando en el puerto configurado
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`); // Log cuando el servidor arranca
});

