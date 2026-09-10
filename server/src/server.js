import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect Database & Start Server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`[SkillForge Server] Running on port ${PORT}`);
    console.log(`[SkillForge Health] Health endpoint available at http://localhost:${PORT}/api/health`);
  });
};

startServer();
