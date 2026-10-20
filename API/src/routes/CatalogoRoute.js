import { Router } from 'express';
import { getCategories } from '../controllers/CatalogoController.js';

const router = Router();
router.get('/categorias', getCategories);

export default router;
