import { Router } from 'express';
import { createInventoryMovement, getInventoryHistory } from '../controllers/InventarioController.js';
import auth from '../middleware/autenticacion.js';
import permitRoles from '../middleware/role.js';

const router = Router();

router.get('/inventario/:id/historial', auth, permitRoles('administrador', 'bodeguero'), getInventoryHistory);
router.post('/inventario/movimiento', auth, permitRoles('administrador', 'bodeguero'), createInventoryMovement);

export default router;
