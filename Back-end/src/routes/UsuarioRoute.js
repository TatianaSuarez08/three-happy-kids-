import { Router } from 'express'; // Router de Express para definir rutas agrupadas
import { loginUser, registerUser } from '../controllers/UsuarioController.js'; // Controladores de login y registro
import auth from '../middleware/autenticacion.js';

const router = Router(); // Crea una instancia de Router

// Ruta POST para registrar un nuevo usuario
router.post('/registro', registerUser);

// Ruta POST para iniciar sesión: recibe credenciales y llama a `loginUser`
router.post('/login', loginUser);

// Ruta para obtener información del usuario autenticado (requiere token)
router.get('/me', auth, (req, res) => {
	res.json({ user: req.user });
});

// Exporta solo las rutas; preparado para futuras expansiones
export default router; // Exporta el router para montarlo en la app principal
