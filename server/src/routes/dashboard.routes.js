import express from 'express';
import { getDashboard } from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/dashboard - Aggregated student dashboard data
router.get('/', protect, getDashboard);

export default router;
