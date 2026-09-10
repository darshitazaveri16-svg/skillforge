import { Router } from 'express';
import {
  startAssessment,
  submitAnswer,
  completeAssessment,
  getLatestResult,
  getHistory,
  getAssessmentById,
} from '../controllers/assessment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// All assessment routes are protected
router.use(protect);

router.post('/start', startAssessment);
router.post('/:id/submit', submitAnswer);
router.post('/:id/complete', completeAssessment);
router.get('/latest', getLatestResult);
router.get('/history', getHistory);
router.get('/:id', getAssessmentById);

export default router;
