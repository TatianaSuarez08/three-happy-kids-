import { Router } from 'express';
import healthRoutes from './health.routes.js';
import { backendProxy, usersProxy, usersServiceProxy } from '../clients/proxy.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/users', usersServiceProxy);
router.use('/auth', usersProxy);
router.use(backendProxy);

export default router;
