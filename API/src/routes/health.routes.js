import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ success: true, service: 'api-gateway', status: 'ok' });
});

export default router;
