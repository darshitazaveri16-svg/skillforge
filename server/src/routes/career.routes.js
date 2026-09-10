import { Router } from 'express';
import { getCareers, getCareerById, getCareerSkills } from '../controllers/career.controller.js';

const router = Router();

router.get('/', getCareers);
router.get('/:id', getCareerById);
router.get('/:id/skills', getCareerSkills);

export default router;
