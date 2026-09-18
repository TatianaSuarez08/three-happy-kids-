import { Router } from 'express';
import { changeOrderStatus, getMyOrders, getOrders, placeOrder } from '../controllers/PedidoController.js';
import auth from '../middleware/autenticacion.js';
import permitRoles from '../middleware/role.js';

const router = Router();

router.get('/pedidos', auth, permitRoles('administrador', 'bodeguero', 'mensajero', { permission: 'pedidos:read' }), getOrders);
router.post('/pedidos', auth, permitRoles('administrador', 'bodeguero', 'mensajero', 'cliente', { permission: 'comprar' }), placeOrder);
router.put('/pedidos/:id/estado', auth, permitRoles('administrador', 'mensajero', { permission: 'pedidos:write' }), changeOrderStatus);
router.get('/mis-pedidos', auth, permitRoles('administrador', 'bodeguero', 'mensajero', 'cliente', { permission: 'pedidos:own:read' }), getMyOrders);

export default router;
