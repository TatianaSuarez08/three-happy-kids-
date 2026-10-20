import { Router } from 'express';
import {
  createFavorite,
  deleteFavorite,
  getFavorites
} from '../controllers/FavoritoController.js';
import auth from '../middleware/autenticacion.js';

const router = Router();

router.get('/favoritos', auth, getFavorites);
router.post('/favoritos', auth, createFavorite);
router.delete('/favoritos/:productId', auth, deleteFavorite);

export default router;
