import express from 'express';
import {
  analyzeResume,
  getLatestResumeAnalysis,
  getResumeHistory,
  getResumeAnalysisById,
} from '../controllers/resume.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { handleResumeUpload } from '../middleware/upload.middleware.js';

const router = express.Router();

// All resume routes are protected
router.post('/analyze', protect, handleResumeUpload, analyzeResume);
router.get('/latest', protect, getLatestResumeAnalysis);
router.get('/history', protect, getResumeHistory);
router.get('/:id', protect, getResumeAnalysisById);

export default router;
