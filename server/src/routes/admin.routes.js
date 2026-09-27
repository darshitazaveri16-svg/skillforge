import express from 'express';
import {
  getAdminDashboard,
  getStudents,
  getAdminCareers,
  createCareer,
  updateCareer,
  deleteCareer,
  getAdminSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  getAdminQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/admin.controller.js';
import { protect, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Enforce authentication & admin authorization on all routes
router.use(protect);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', getAdminDashboard);

// Students
router.get('/students', getStudents);

// Careers
router.get('/careers', getAdminCareers);
router.post('/careers', createCareer);
router.put('/careers/:id', updateCareer);
router.delete('/careers/:id', deleteCareer);

// Skills
router.get('/skills', getAdminSkills);
router.post('/skills', createSkill);
router.put('/skills/:id', updateSkill);
router.delete('/skills/:id', deleteSkill);

// Questions
router.get('/questions', getAdminQuestions);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

export default router;
