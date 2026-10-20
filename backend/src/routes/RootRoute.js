import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'API de Express con MySQL lista'
  });
});

export default router;
