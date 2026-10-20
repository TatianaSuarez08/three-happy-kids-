import { Router } from 'express';
import {
  addProduct,
  editProduct,
  getColors,
  getProduct,
  getProducts,
  removeProduct
} from '../controllers/ProductoController.js';
import auth from '../middleware/autenticacion.js';
import permitRoles from '../middleware/role.js';
import { uploadProductImage } from '../middleware/subidaImagen.js';

const router = Router();
const productosAdmin = [auth, permitRoles('administrador', 'bodeguero', { permission: 'productos:write' })];
const productosRead = [auth, permitRoles('administrador', 'bodeguero', { permission: 'productos:read' })];

router.get('/productos-publicos', getProducts);
router.get('/productos-publicos/:id', getProduct);
router.get('/colores', ...productosRead, getColors);
router.get('/productos', ...productosRead, getProducts);
router.get('/productos/:id', ...productosRead, getProduct);
router.post(
  '/productos',
  ...productosAdmin,
  uploadProductImage.single('imagen'),
  addProduct
);
router.put(
  '/productos/:id',
  ...productosAdmin,
  uploadProductImage.single('imagen'),
  editProduct
);
router.delete('/productos/:id', ...productosAdmin, removeProduct);

export default router;
