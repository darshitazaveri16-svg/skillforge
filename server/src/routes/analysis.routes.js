import { Router } from 'express';
import { getCareerReadinessAnalysis } from '../controllers/analysis.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Protected analysis route
router.get('/readiness', protect, getCareerReadinessAnalysis);

export default router;
