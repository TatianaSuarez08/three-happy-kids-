import { Router } from 'express';
import { getCategories, getDocumentTypes } from '../controllers/CatalogoController.js';

const router = Router();
router.get('/categorias', getCategories);
router.get('/tipos-documento', getDocumentTypes);

export default router;
