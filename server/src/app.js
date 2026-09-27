import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import careerRoutes from './routes/career.routes.js';
import skillRoutes from './routes/skill.routes.js';
import assessmentRoutes from './routes/assessment.routes.js';
import analysisRoutes from './routes/analysis.routes.js';
import roadmapRoutes from './routes/roadmap.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import adminRoutes from './routes/admin.routes.js';

dotenv.config();

const app = express();

// Production & Development CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

const envClientUrl = process.env.CLIENT_URL || process.env.CORS_ORIGIN;
if (envClientUrl) {
  envClientUrl.split(',').forEach((url) => {
    const trimmed = url.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server tests, curl, mobile)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*') || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS policy`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json());

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all 404 Handler for Unrecognized Routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.method} ${req.originalUrl}' not found.`,
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[SkillForge Error]', err.message);

  const statusCode = err.status || err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  // Prevent leaking stack traces, database URIs, or credentials in responses
  const safeMessage =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred. Please try again later.'
      : err.message || 'Server error occurred.';

  res.status(statusCode).json({
    success: false,
    message: safeMessage,
  });
});

export default app;
