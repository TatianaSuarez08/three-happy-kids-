import { Router } from 'express';
import {
  addProduct,
  editProduct,
  getProduct,
  getProducts,
  removeProduct
} from '../controllers/ProductoController.js';
import auth from '../middleware/autenticacion.js';
import permitRoles from '../middleware/role.js';
import { uploadProductImage } from '../middleware/subidaImagen.js';

const router = Router();
const administrador = [auth, permitRoles('administrador')];

router.get('/productos', ...administrador, getProducts);
router.get('/productos/:id', ...administrador, getProduct);
router.post(
  '/productos',
  ...administrador,
  uploadProductImage.single('imagen'),
  addProduct
);
router.put(
  '/productos/:id',
  ...administrador,
  uploadProductImage.single('imagen'),
  editProduct
);
router.delete('/productos/:id', ...administrador, removeProduct);

export default router;
