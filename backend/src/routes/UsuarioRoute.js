import { Router } from 'express'; // Router de Express para definir rutas agrupadas
import { getDocumentTypes, getMyProfile, loginUser, registerUser, updateMyProfilePhoto } from '../controllers/UsuarioController.js'; // Controladores de login y registro
import { requestPasswordReset, resetPassword } from '../controllers/PasswordRecoveryController.js';
import auth from '../middleware/autenticacion.js';
import { uploadProfileImage } from '../middleware/subidaImagen.js';
import { createRateLimiter } from '../middleware/rateLimit.js';

const router = Router(); // Crea una instancia de Router
const limitPasswordResetRequests = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });
const limitPasswordResetAttempts = createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });

// Ruta POST para registrar un nuevo usuario
router.post('/registro', registerUser);
router.get('/tipos-documento', getDocumentTypes);

// Ruta POST para iniciar sesión: recibe credenciales y llama a `loginUser`
router.post('/login', loginUser);
router.post('/recuperar-contrasena', limitPasswordResetRequests, requestPasswordReset);
router.post('/restablecer-contrasena', limitPasswordResetAttempts, resetPassword);

// Ruta para obtener información del usuario autenticado (requiere token)
router.get('/me', auth, getMyProfile);
router.put('/me/foto', auth, uploadProfileImage.single('foto'), updateMyProfilePhoto);

// Exporta solo las rutas; preparado para futuras expansiones
export default router; // Exporta el router para montarlo en la app principal
