import { Router } from 'express';
import { getLogistica } from '../controllers/LogisticaController.js';
import auth from '../middleware/autenticacion.js';
import permitRoles from '../middleware/role.js';

const router = Router();

router.get('/logistica', auth, permitRoles('administrador'), getLogistica);

export default router;
