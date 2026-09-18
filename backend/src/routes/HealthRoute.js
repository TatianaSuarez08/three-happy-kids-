import { Router } from 'express';
import { getHealth } from '../controllers/HealthController.js';

const router = Router();

router.get('/health', getHealth);

export default router;