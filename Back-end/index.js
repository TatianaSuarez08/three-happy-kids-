import 'dotenv/config'; // Carga variables de entorno desde un archivo .env (side-effect import)
import express from 'express'; // Importa el framework Express para crear el servidor
import cors from 'cors'; // Importa middleware para habilitar CORS (peticiones entre orígenes)
import morgan from 'morgan'; // Importa logger HTTP para desarrollo

import './src/db.js'; // Ejecuta la inicialización de la base de datos (conexión a MySQL)
import userRoutes from './src/routes/UsuarioRoute.js'; // Importa las rutas relacionadas con usuarios

const app = express(); // Crea la instancia de la aplicación Express

const PORT = process.env.PORT || 3000; // Define el puerto: usa la variable de entorno o 3000 por defecto

app.use(cors()); // Activa CORS para permitir solicitudes desde otros orígenes
app.use(express.json()); // Middleware para parsear bodies en formato JSON
app.use(express.urlencoded({ extended: true })); // Middleware para parsear bodies URL-encoded (formularios)
app.use(morgan('dev')); // Activa el logger en modo 'dev' para ver peticiones en consola

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

// Inicia el servidor escuchando en el puerto configurado
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`); // Log cuando el servidor arranca
});

