import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';
import { requireInternalGateway } from '../middlewares/internal-auth.js';

const router = Router();

router.use(requireInternalGateway);
router.get('/health', getHealth);

export default router;
