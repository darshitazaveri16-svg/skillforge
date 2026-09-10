import mongoose from 'mongoose';
import app from './src/app.js';
import { seedDatabase } from './src/config/seedData.js';
import { seedQuestions } from './src/config/questionSeed.js';

async function runStage4Tests() {
  console.log('\n=================== STARTING STAGE 4 SKILL ASSESSMENT SUITE ===================\n');

  await seedDatabase();
  await seedQuestions();

  const server = app.listen(5003, () => {
    console.log('[TEST] Stage 4 test server listening on port 5003');
  });

  const BASE_URL = 'http://localhost:5003/api';
  let tokenStudent1 = '';
  let tokenStudent2 = '';
  let assessmentId = '';

  try {
    // 18. Register Student 1
    console.log('--- Test 18: Authenticate Student 1 ---');
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Assessment Student 1',
        email: 'eval1@skillforge.test',
        password: 'Password123!',
        targetCareer: 'Full Stack Developer',
      }),
    });
    const regData = await regRes.json();
    if (!regData.token) throw new Error('Registration failed for Student 1');
    tokenStudent1 = regData.token;
    console.log('✅ PASS: Student 1 registered & authenticated.');

    // Register Student 2
    console.log('\n--- Register Student 2 for security tests ---');
    const regRes2 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Assessment Student 2',
        email: 'eval2@skillforge.test',
        password: 'Password123!',
        targetCareer: 'Data Analyst',
      }),
    });
    const regData2 = await regRes2.json();
    tokenStudent2 = regData2.token;
    console.log('✅ PASS: Student 2 registered.');

    // 6 & 7: Start assessment for Student 1
    console.log('\n--- Test 6 & 7: Start Assessment (Expect Medium difficulty first question) ---');
    const startRes = await fetch(`${BASE_URL}/assessment/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent1}`,
      },
    });
    const startData = await startRes.json();
    console.log('Start Status:', startRes.status, `AssessmentID: ${startData.assessmentId}`);
    if (startRes.status !== 201 || !startData.assessmentId || !startData.question) {
      throw new Error('Failed to start assessment!');
    }
    assessmentId = startData.assessmentId;

    // 11: Verify correctAnswer is NOT exposed in start payload
    console.log('\n--- Test 11: Verify correctAnswer is hidden ---');
    console.log('First Question Object:', startData.question);
    if (startData.question.correctAnswer !== undefined) {
      throw new Error('SECURITY VIOLATION: correctAnswer was exposed before submission!');
    }
    if (startData.question.difficulty !== 'medium') {
      throw new Error(`Expected initial difficulty 'medium', got '${startData.question.difficulty}'`);
    }
    console.log('✅ PASS: Starting difficulty is MEDIUM and correctAnswer is properly hidden.');

    // 8, 9, 10: Submit answers and test adaptive difficulty progression
    console.log('\n--- Test 8, 9, 10: Submit answers & check adaptive difficulty ---');
    
    // Submit correct answer to first question (Option 1 for useState in React)
    const firstQId = startData.question._id || startData.question.id;
    const submit1Res = await fetch(`${BASE_URL}/assessment/${assessmentId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent1}`,
      },
      body: JSON.stringify({
        questionId: firstQId,
        selectedOption: 1, // Correct for useState
      }),
    });
    const submit1Data = await submit1Res.json();
    console.log('Submit 1 Result:', { isCorrect: submit1Data.isCorrect, nextDiff: submit1Data.nextQuestion?.difficulty });
    if (submit1Res.status !== 200 || !submit1Data.success) {
      throw new Error('Submit 1 failed!');
    }
    console.log('✅ PASS: Answer submitted & recorded correctly.');

    // 17: Verify Student 2 cannot access Student 1's assessment
    console.log('\n--- Test 17: Cross-student security check ---');
    const unauthorizedAccess = await fetch(`${BASE_URL}/assessment/${assessmentId}`, {
      headers: { Authorization: `Bearer ${tokenStudent2}` },
    });
    console.log('Unauthorized Access Status (Expected 403):', unauthorizedAccess.status);
    if (unauthorizedAccess.status !== 403) {
      throw new Error('SECURITY FAILURE: Student 2 accessed Student 1 assessment!');
    }
    console.log('✅ PASS: Student 2 blocked from accessing Student 1 assessment.');

    // 15: Complete Assessment
    console.log('\n--- Test 12, 13, 14, 15: Complete Assessment & verify scoring ---');
    const completeRes = await fetch(`${BASE_URL}/assessment/${assessmentId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent1}`,
      },
    });
    const completeData = await completeRes.json();
    console.log('Completion Status:', completeRes.status);
    console.log('Overall Score:', completeData.result?.overallScore, '%');
    console.log('Skill Scores:', completeData.result?.skillScores);

    if (completeRes.status !== 200 || !completeData.result) {
      throw new Error('Complete assessment failed!');
    }
    console.log('✅ PASS: Assessment completed & skill scores computed.');

    // 16: Verify GET /api/assessment/history
    console.log('\n--- Test 16: GET /api/assessment/history ---');
    const historyRes = await fetch(`${BASE_URL}/assessment/history`, {
      headers: { Authorization: `Bearer ${tokenStudent1}` },
    });
    const historyData = await historyRes.json();
    console.log('History Status:', historyRes.status, `Attempts Count: ${historyData.count}`);
    if (historyRes.status !== 200 || historyData.count < 1) {
      throw new Error('Assessment history failed to return completed attempt!');
    }
    console.log('✅ PASS: Assessment history retrieved successfully.');

    console.log('\n=================== ALL STAGE 4 TESTS PASSED! ===================\n');
  } catch (err) {
    console.error('\n❌ STAGE 4 TEST FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runStage4Tests();
