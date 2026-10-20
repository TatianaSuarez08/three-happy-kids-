import { Router } from 'express';
import { getDashboard } from '../controllers/DashboardController.js';
import auth from '../middleware/autenticacion.js';
import permitRoles from '../middleware/role.js';

const router = Router();
router.get('/dashboard', auth, permitRoles('administrador', { permission: 'dashboard:read' }), getDashboard);

export default router;
