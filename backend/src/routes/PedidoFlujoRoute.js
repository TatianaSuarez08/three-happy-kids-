import { Router } from 'express';
import {
  assignCourier,
  assignWarehouse,
  changeCourierStatus,
  getAdminNovelties,
  getCourierAssigned,
  getCourierAvailable,
  getCourierEvidence,
  getWarehouseAssigned,
  getWarehouseAvailable,
  resolveAdminNovelty,
  submitPreparation,
  uploadCourierEvidence
} from '../controllers/PedidoFlujoController.js';
import auth from '../middleware/autenticacion.js';
import permitRoles from '../middleware/role.js';
import { uploadDeliveryEvidence } from '../middleware/subidaImagen.js';

const router = Router();
const uploadEvidence = (req, res, next) => {
  uploadDeliveryEvidence.single('evidencia')(req, res, (error) => {
    if (!error) return next();
    const tooLarge = error.code === 'LIMIT_FILE_SIZE';
    return res.status(tooLarge ? 413 : 400).json({
      error: tooLarge
        ? 'La fotografía no puede superar 5 MB'
        : error.message || 'No se pudo leer la fotografía'
    });
  });
};

router.get('/bodega/pedidos/disponibles', auth, permitRoles('bodeguero', 'administrador'), getWarehouseAvailable);
router.get('/bodega/pedidos/mios', auth, permitRoles('bodeguero'), getWarehouseAssigned);
router.post('/bodega/pedidos/:id/asignar', auth, permitRoles('bodeguero'), assignWarehouse);
router.put('/bodega/pedidos/:id/preparacion', auth, permitRoles('bodeguero'), submitPreparation);

router.get('/mensajeria/pedidos/disponibles', auth, permitRoles('mensajero'), getCourierAvailable);
router.get('/mensajeria/mis-entregas', auth, permitRoles('mensajero'), getCourierAssigned);
router.post('/mensajeria/pedidos/:id/asignar', auth, permitRoles('mensajero'), assignCourier);
router.put('/mensajeria/pedidos/:id/estado', auth, permitRoles('mensajero'), changeCourierStatus);
router.post('/mensajeria/pedidos/:id/evidencia', auth, permitRoles('mensajero'), uploadEvidence, uploadCourierEvidence);
router.get('/mensajeria/pedidos/:id/evidencia', auth, permitRoles('mensajero', 'administrador'), getCourierEvidence);

router.get('/admin/novedades/pedidos', auth, permitRoles('administrador'), getAdminNovelties);
router.put('/admin/novedades/pedidos/:id/resolver', auth, permitRoles('administrador'), resolveAdminNovelty);

export default router;
