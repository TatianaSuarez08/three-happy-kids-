import { Router } from 'express';
import { changeOrderStatus, getMyOrders, getOrders, placeOrder } from '../controllers/PedidoController.js';
import auth from '../middleware/autenticacion.js';
import permitRoles from '../middleware/role.js';

const router = Router();

router.get('/pedidos', auth, permitRoles('administrador'), getOrders);
router.post('/pedidos', auth, placeOrder);
router.put('/pedidos/:id/estado', auth, permitRoles('administrador'), changeOrderStatus);
router.get('/mis-pedidos', auth, getMyOrders);

export default router;
