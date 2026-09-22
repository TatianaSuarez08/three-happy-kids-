import { Router } from 'express';
import {
  changeCartItem,
  createCartItem,
  deleteCart,
  deleteCartItem,
  getCart
} from '../controllers/CarritoController.js';
import auth from '../middleware/autenticacion.js';

const router = Router();

router.get('/carrito', auth, getCart);
router.post('/carrito', auth, createCartItem);
router.put('/carrito/:productId', auth, changeCartItem);
router.delete('/carrito/:productId', auth, deleteCartItem);
router.delete('/carrito', auth, deleteCart);

export default router;
