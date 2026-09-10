import app from './app.js';
import { connectDB } from './config/db.js';
import { seedDatabase } from './config/seedData.js';
import { seedQuestions } from './config/questionSeed.js';

const PORT = process.env.PORT || 5000;

// Connect Database, Seed Data & Start Server
const startServer = async () => {
  await connectDB();
  await seedDatabase();
  await seedQuestions();
  
  app.listen(PORT, () => {
    console.log(`[SkillForge Server] Running on port ${PORT}`);
    console.log(`[SkillForge Health] Health endpoint available at http://localhost:${PORT}/api/health`);
    console.log(`[SkillForge Assessment] Assessment endpoints ready at http://localhost:${PORT}/api/assessment`);
  });
};

startServer();
