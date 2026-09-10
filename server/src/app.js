import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import careerRoutes from './routes/career.routes.js';
import skillRoutes from './routes/skill.routes.js';
import assessmentRoutes from './routes/assessment.routes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/assessment', assessmentRoutes);

export default app;
