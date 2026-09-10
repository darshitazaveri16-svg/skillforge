import { Router } from 'express';
import {
  getRoadmap,
  generateRoadmapController,
  toggleItemCompletion,
} from '../controllers/roadmap.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// All roadmap routes are protected
router.use(protect);

router.get('/', getRoadmap);
router.post('/generate', generateRoadmapController);
router.patch('/items/:itemId', toggleItemCompletion);

export default router;
