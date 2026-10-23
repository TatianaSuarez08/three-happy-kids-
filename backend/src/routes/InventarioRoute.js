import { Router } from 'express';
import {
  createInventoryMovement,
  createActivityReport,
  createPurchase,
  getInventoryActivity,
  getInventoryHistory,
  getPurchaseCreationOptions,
  getPurchasesForReceipt,
  receivePurchase
} from '../controllers/InventarioController.js';
import auth from '../middleware/autenticacion.js';
import permitRoles from '../middleware/role.js';

const router = Router();

router.get('/inventario/:id/historial', auth, permitRoles('administrador', 'bodeguero'), getInventoryHistory);
router.get('/inventario/actividad', auth, permitRoles('administrador', 'bodeguero'), getInventoryActivity);
router.post('/inventario/actividad/reportes', auth, permitRoles('administrador'), createActivityReport);
router.get('/admin/compras/opciones', auth, permitRoles('administrador'), getPurchaseCreationOptions);
router.post('/admin/compras', auth, permitRoles('administrador'), createPurchase);
router.get('/bodega/compras', auth, permitRoles('administrador', 'bodeguero'), getPurchasesForReceipt);
router.post('/bodega/compras/:id/recepcion', auth, permitRoles('bodeguero'), receivePurchase);
router.post('/inventario/movimiento', auth, permitRoles('administrador', 'bodeguero'), createInventoryMovement);

export default router;
