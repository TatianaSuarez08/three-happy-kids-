import { Router } from 'express'; // Router de Express para definir rutas agrupadas
import { loginUser } from '../controllers/UsuarioController.js'; // Controlador de login
import auth from '../middleware/autenticacion.js';

const router = Router(); // Crea una instancia de Router

// Ruta POST para iniciar sesión: recibe credenciales y llama a `loginUser`
router.post('/login', loginUser);

// Ruta para obtener información del usuario autenticado (requiere token)
router.get('/me', auth, (req, res) => {
	res.json({ user: req.user });
});

// Exporta solo la ruta de login y /me; preparado para futuras expansiones
export default router; // Exporta el router para montarlo en la app principal
