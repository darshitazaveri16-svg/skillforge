import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { seedDatabase } from './src/config/seedData.js';
import { seedQuestions } from './src/config/questionSeed.js';
import User from './src/models/User.js';
import Career from './src/models/Career.js';
import Skill from './src/models/Skill.js';
import Question from './src/models/Question.js';
import Assessment from './src/models/Assessment.js';
import AssessmentResult from './src/models/AssessmentResult.js';
import Roadmap from './src/models/Roadmap.js';

dotenv.config();

const PORT = 5015;

async function runPersistenceVerification() {
  console.log('\n===============================================================');
  console.log('    SKILLFORGE — MONGODB ATLAS INTEGRATION & PERSISTENCE TEST   ');
  console.log('===============================================================\n');

  const results = {
    connection: false,
    database: false,
    careersSeed: false,
    skillsSeed: false,
    questionsSeed: false,
    userCreation: false,
    userStorage: false,
    userReadback: false,
    persistenceAcrossRestart: false,
    authLogin: false,
    careerSelection: false,
    assessmentCreation: false,
    resultPersistence: false,
    skillGap: false,
    roadmapPersistence: false,
    dashboard: false,
    collectionsVerified: false,
  };

  let server;
  let testUserId = null;

  try {
    // Step 1: Connect to Database
    console.log('--- STEP 1: Connect to MongoDB ---');
    const conn = await connectDB();
    if (!conn || mongoose.connection.readyState !== 1) {
      throw new Error('Could not establish persistent connection to MongoDB');
    }
    results.connection = true;

    const dbName = mongoose.connection.name;
    console.log(`[Verify] Active Database: ${dbName}`);
    if (dbName === 'skillforge') {
      results.database = true;
    }

    // Step 2: Seed Database
    console.log('\n--- STEP 2: Execute Idempotent Seed Operations ---');
    await seedDatabase();
    await seedQuestions();

    const careersCount = await Career.countDocuments();
    const skillsCount = await Skill.countDocuments();
    const questionsCount = await Question.countDocuments();

    console.log(`[Verify] Careers count in Atlas: ${careersCount} (Expected: 4)`);
    console.log(`[Verify] Skills count in Atlas: ${skillsCount} (Expected: 28)`);
    console.log(`[Verify] Questions count in Atlas: ${questionsCount} (Expected: 84)`);

    if (careersCount >= 4) results.careersSeed = true;
    if (skillsCount >= 28) results.skillsSeed = true;
    if (questionsCount >= 84) results.questionsSeed = true;

    // Step 3: Launch Test Server
    server = app.listen(PORT, '127.0.0.1', () => {
      console.log(`\n[Verify] Verification API listening on port ${PORT}`);
    });
    const BASE_URL = `http://127.0.0.1:${PORT}/api`;

    // Step 4: Health Check
    console.log('\n--- STEP 3: Check Health Endpoint ---');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log('[Verify] Health status:', healthRes.status, healthData);

    // Step 5: Register User
    console.log('\n--- STEP 4: Test User Registration ---');
    const testEmail = `atlas_verify_${Date.now()}@skillforge.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Atlas Verification User',
        email: testEmail,
        password: 'Password123!',
      }),
    });
    const regData = await regRes.json();
    if (regRes.status !== 201 || !regData.token) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }
    testUserId = regData.user._id || regData.user.id;
    let authToken = regData.token;
    results.userCreation = true;
    console.log(`[Verify] User created via API. ID: ${testUserId}`);

    // Step 6: Verify User Storage in MongoDB Atlas directly
    console.log('\n--- STEP 5: Verify Direct Storage in MongoDB Atlas ---');
    const userInDb = await User.findById(testUserId);
    if (!userInDb || userInDb.email !== testEmail) {
      throw new Error('User was not found directly in MongoDB Atlas collection!');
    }
    results.userStorage = true;
    results.userReadback = true;
    console.log('[Verify] User confirmed stored directly in Atlas "users" collection');

    // Step 7: Disconnect & Reconnect (Simulate Process Restart)
    console.log('\n--- STEP 6: Simulate Restart / Persistence Across Disconnect ---');
    await mongoose.disconnect();
    console.log('[Verify] Disconnected from MongoDB');
    
    // Reconnect
    await connectDB();
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Reconnection to MongoDB Atlas failed!');
    }
    
    const reloadedUser = await User.findById(testUserId);
    if (!reloadedUser || reloadedUser.email !== testEmail) {
      throw new Error('User did not persist across reconnection!');
    }
    results.persistenceAcrossRestart = true;
    console.log('[Verify] PASS: User persisted across database disconnect/reconnect cycle!');

    // Step 8: Authenticate / Login
    console.log('\n--- STEP 7: Test Login with Persistent User ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password123!',
      }),
    });
    const loginData = await loginRes.json();
    if (loginRes.status !== 200 || !loginData.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    authToken = loginData.token;
    results.authLogin = true;
    console.log('[Verify] PASS: Logged in successfully using credentials stored in Atlas');

    // Step 9: Select Target Career
    console.log('\n--- STEP 8: Target Career Selection & Persistence ---');
    const careerDoc = await Career.findOne({ name: 'Data Analyst' });
    if (!careerDoc) throw new Error('Data Analyst career not found in Atlas');

    const updateCareerRes = await fetch(`${BASE_URL}/auth/profile/career`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ careerId: careerDoc._id.toString() }),
    });
    const updateCareerData = await updateCareerRes.json();
    if (updateCareerRes.status !== 200 || !updateCareerData.success) {
      throw new Error(`Career update failed: ${JSON.stringify(updateCareerData)}`);
    }
    
    // Verify in Atlas
    const userAfterCareer = await User.findById(testUserId);
    if (!userAfterCareer.targetCareerRef || userAfterCareer.targetCareer !== 'Data Analyst') {
      throw new Error('Career ref was not persisted in MongoDB Atlas user document!');
    }
    results.careerSelection = true;
    console.log('[Verify] PASS: Target career updated and verified in Atlas user document');

    // Step 10: Start Assessment
    console.log('\n--- STEP 9: Start Assessment in Atlas ---');
    const startRes = await fetch(`${BASE_URL}/assessment/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });
    const startData = await startRes.json();
    if (startRes.status !== 201 || !startData.assessmentId) {
      throw new Error(`Assessment start failed: ${JSON.stringify(startData)}`);
    }
    const assessmentId = startData.assessmentId;
    
    // Verify assessment in Atlas
    const asmDoc = await Assessment.findById(assessmentId);
    if (!asmDoc) {
      throw new Error('Assessment document was not found in Atlas "assessments" collection!');
    }
    results.assessmentCreation = true;
    console.log(`[Verify] PASS: Assessment created and stored in Atlas. ID: ${assessmentId}`);

    // Step 11: Submit Answer and Complete Assessment
    console.log('\n--- STEP 10: Submit Answer and Complete Assessment ---');
    const firstQ = startData.question;
    const submitRes = await fetch(`${BASE_URL}/assessment/${assessmentId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        questionId: firstQ._id || firstQ.id,
        selectedOption: 0,
        timeSpent: 15,
      }),
    });
    const submitData = await submitRes.json();
    if (submitRes.status !== 200 || !submitData.success) {
      throw new Error(`Submit answer failed: ${JSON.stringify(submitData)}`);
    }

    const completeRes = await fetch(`${BASE_URL}/assessment/${assessmentId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });
    const completeData = await completeRes.json();
    if (completeRes.status !== 200 || !completeData.success) {
      throw new Error(`Complete assessment failed: ${JSON.stringify(completeData)}`);
    }

    // Verify AssessmentResult in Atlas
    const resultDoc = await AssessmentResult.findOne({ user: testUserId });
    if (!resultDoc) {
      throw new Error('Assessment result not found in Atlas "assessmentresults" collection!');
    }
    results.resultPersistence = true;
    console.log('[Verify] PASS: Assessment completed and result saved in Atlas "assessmentresults"');

    // Step 12: Skill Gap / Career Readiness
    console.log('\n--- STEP 11: Skill Gap & Career Readiness Analysis ---');
    const readinessRes = await fetch(`${BASE_URL}/analysis/readiness`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const readinessData = await readinessRes.json();
    if (readinessRes.status !== 200 || !readinessData.success) {
      throw new Error(`Readiness analysis failed: ${JSON.stringify(readinessData)}`);
    }
    const score = readinessData.readinessScore ?? readinessData.data?.readinessScore;
    results.skillGap = true;
    console.log('[Verify] PASS: Skill gap readiness calculated from persistent data. Score:', score);

    // Step 13: Roadmap Persistence
    console.log('\n--- STEP 12: Learning Roadmap Persistence ---');
    const roadmapRes = await fetch(`${BASE_URL}/roadmap/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });
    const roadmapData = await roadmapRes.json();
    if (roadmapRes.status !== 200 || !roadmapData.success) {
      throw new Error(`Roadmap generation failed: ${JSON.stringify(roadmapData)}`);
    }

    const roadmapDoc = await Roadmap.findOne({ user: testUserId });
    if (!roadmapDoc) {
      throw new Error('Roadmap document not found in Atlas "roadmaps" collection!');
    }
    results.roadmapPersistence = true;
    console.log('[Verify] PASS: Roadmap generated and verified in Atlas "roadmaps" collection');

    // Step 14: Dashboard Analytics
    console.log('\n--- STEP 13: Student Dashboard Metrics ---');
    const dashRes = await fetch(`${BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const dashData = await dashRes.json();
    if (dashRes.status !== 200 || !dashData.student) {
      throw new Error(`Dashboard API failed: ${JSON.stringify(dashData)}`);
    }
    results.dashboard = true;
    console.log('[Verify] PASS: Dashboard retrieved aggregated persistent data successfully');

    // Step 15: Verify all Collections in Atlas
    console.log('\n--- STEP 14: Inspect Collections in Atlas ---');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);
    console.log('[Verify] Collections present in Atlas:', collectionNames);

    const requiredCollections = [
      'users',
      'careers',
      'skills',
      'questions',
      'assessments',
      'assessmentresults',
      'roadmaps',
    ];
    const missingCollections = requiredCollections.filter((c) => !collectionNames.includes(c));
    if (missingCollections.length === 0) {
      results.collectionsVerified = true;
      console.log('✅ PASS: All 7 required collections confirmed present in MongoDB Atlas!');
    } else {
      console.warn('⚠️ Missing collections:', missingCollections);
    }

    // Step 16: Cleanup Test User and Test Artifacts
    console.log('\n--- STEP 15: Clean Up Test Artifacts ---');
    await User.findByIdAndDelete(testUserId);
    await Assessment.deleteMany({ user: testUserId });
    await AssessmentResult.deleteMany({ user: testUserId });
    await Roadmap.deleteMany({ user: testUserId });
    console.log('[Verify] Test user and test documents cleaned up from Atlas.');

  } catch (err) {
    console.error('\n❌ VERIFICATION ERROR:', err.message);
  } finally {
    if (server) {
      server.close();
    }
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }

  console.log('\n===============================================================');
  console.log('                    VERIFICATION SUMMARY                      ');
  console.log('===============================================================');
  for (const [key, val] of Object.entries(results)) {
    console.log(`- ${key}: ${val ? 'PASS' : 'FAIL'}`);
  }

  const allPassed = Object.values(results).every(Boolean);
  console.log(`\nOVERALL PERSISTENCE VERIFICATION: ${allPassed ? 'ALL PASS' : 'SOME CHECKS FAILED'}\n`);
  return results;
}

runPersistenceVerification();
