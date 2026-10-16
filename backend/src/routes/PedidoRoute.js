import { Router } from 'express';
import {
  assignOrder,
  addDeliveryEvidence,
  changeOrderStatus,
  getEvidenceImage,
  getOrderEvidence,
  getAvailableDeliveries,
  getMyDeliveries,
  getMyOrders,
  getOrderOperationHistory,
  getOrderAssignmentHistory,
  getOrderPreparationHistory,
  getBodegaIssues,
  getBodegaOrderIssues,
  respondToBodegaIssue,
  getOrdersForPreparation,
  getPreparedOrders,
  getOrders,
  beginOrderPreparation,
  placeOrder,
  prepareOrder,
  reassignOrder
} from '../controllers/PedidoController.js';
import auth from '../middleware/autenticacion.js';
import permitRoles from '../middleware/role.js';
import { deliveryImageMaxBytes, uploadDeliveryEvidence } from '../middleware/subidaImagen.js';

const router = Router();

const handleEvidenceUpload = (req, res, next) => {
  uploadDeliveryEvidence.single('evidencia')(req, res, (error) => {
    if (!error) return next();
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: `La imagen supera el límite de ${(deliveryImageMaxBytes / (1024 * 1024)).toFixed(0)} MB`
      });
    }
    console.error('Error al recibir evidencia de entrega:', error);
    return res.status(400).json({ error: 'No se pudo recibir la imagen de evidencia' });
  });
};

router.get('/pedidos', auth, permitRoles('administrador', 'bodeguero', 'mensajero', { permission: 'pedidos:read' }), getOrders);
router.get('/pedidos/preparacion', auth, permitRoles('administrador', 'bodeguero'), getOrdersForPreparation);
router.get('/pedidos/envio', auth, permitRoles('administrador', 'bodeguero'), getPreparedOrders);
router.get('/bodega/novedades', auth, permitRoles('administrador', 'bodeguero'), getBodegaIssues);
router.get('/bodega/pedidos/:id/novedades', auth, permitRoles('bodeguero'), getBodegaOrderIssues);
router.patch('/bodega/novedades/:id', auth, permitRoles('administrador'), respondToBodegaIssue);
router.get('/pedidos/:id/operaciones', auth, permitRoles('administrador', 'bodeguero'), getOrderOperationHistory);
router.get('/pedidos/:id/alistamientos', auth, permitRoles('administrador', 'bodeguero'), getOrderPreparationHistory);
router.post('/pedidos', auth, permitRoles('administrador', 'bodeguero', 'mensajero', 'cliente', { permission: 'comprar' }), placeOrder);
router.get('/entregas/disponibles', auth, permitRoles('mensajero'), getAvailableDeliveries);
router.get('/mis-entregas', auth, permitRoles('mensajero'), getMyDeliveries);
router.post('/pedidos/:id/asignaciones', auth, permitRoles('mensajero'), assignOrder);
router.get('/pedidos/:id/asignaciones', auth, permitRoles('administrador', 'mensajero'), getOrderAssignmentHistory);
router.get('/pedidos/:id/evidencias', auth, permitRoles('administrador', 'mensajero', 'cliente'), getOrderEvidence);
router.get('/evidencias/:id/archivo', auth, permitRoles('administrador', 'mensajero', 'cliente'), getEvidenceImage);
router.post('/pedidos/:id/evidencias', auth, permitRoles('mensajero'), handleEvidenceUpload, addDeliveryEvidence);
router.post('/pedidos/:id/reasignar', auth, permitRoles('administrador'), reassignOrder);
router.post('/pedidos/:id/preparacion/iniciar', auth, permitRoles('administrador', 'bodeguero'), beginOrderPreparation);
router.put('/pedidos/:id/preparacion', auth, permitRoles('administrador', 'bodeguero'), prepareOrder);
router.put('/pedidos/:id/estado', auth, permitRoles('administrador', 'mensajero', { permission: 'pedidos:write' }), changeOrderStatus);
router.get('/mis-pedidos', auth, permitRoles('administrador', 'bodeguero', 'mensajero', 'cliente', { permission: 'pedidos:own:read' }), getMyOrders);

export default router;
