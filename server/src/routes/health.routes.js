import { Router } from 'express';

const router = Router();

// GET /api/health
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    app: 'SkillForge API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;
