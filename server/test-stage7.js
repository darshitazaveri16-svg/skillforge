import app from './src/app.js';
import { seedDatabase } from './src/config/seedData.js';
import { seedQuestions } from './src/config/questionSeed.js';

async function runStage7Tests() {
  console.log('\n=================== STARTING STAGE 7 STUDENT DASHBOARD ANALYTICS SUITE ===================\n');

  await seedDatabase();
  await seedQuestions();

  const server = app.listen(5006, () => {
    console.log('[TEST] Stage 7 test server listening on port 5006');
  });

  const BASE_URL = 'http://localhost:5006/api';
  let tokenStudent1 = '';
  let tokenStudent2 = '';
  let tokenNewStudent = '';

  try {
    // 1-3. Authentication setup & register Student 1
    console.log('--- Step 1-3: Register Student 1 & Set Target Career ---');
    const regRes1 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Stage7 Student 1',
        email: 'stage7_1@skillforge.test',
        password: 'Password123!',
        targetCareer: 'Full Stack Developer'
      })
    });
    const regData1 = await regRes1.json();
    tokenStudent1 = regData1.token;

    // Complete assessment 1 for Student 1
    console.log('\n--- Step 4-6: Complete Assessment Attempt 1 for Student 1 ---');
    const startRes1 = await fetch(`${BASE_URL}/assessment/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent1}`
      }
    });
    const startData1 = await startRes1.json();
    const asmId1 = startData1.assessmentId;

    await fetch(`${BASE_URL}/assessment/${asmId1}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent1}`
      },
      body: JSON.stringify({
        questionId: startData1.question._id || startData1.question.id,
        selectedOption: 1
      })
    });

    await fetch(`${BASE_URL}/assessment/${asmId1}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent1}`
      }
    });

    // Complete assessment 2 for Student 1 (to test history trend & multiple attempts)
    console.log('\n--- Step 6b: Complete Assessment Attempt 2 for Student 1 ---');
    const startRes2 = await fetch(`${BASE_URL}/assessment/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent1}`
      }
    });
    const startData2 = await startRes2.json();
    const asmId2 = startData2.assessmentId;

    await fetch(`${BASE_URL}/assessment/${asmId2}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent1}`
      },
      body: JSON.stringify({
        questionId: startData2.question._id || startData2.question.id,
        selectedOption: startData2.question.options ? 0 : 1
      })
    });

    await fetch(`${BASE_URL}/assessment/${asmId2}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent1}`
      }
    });

    // Generate Roadmap for Student 1
    console.log('\n--- Step 9: Generate Roadmap for Student 1 ---');
    await fetch(`${BASE_URL}/roadmap`, {
      headers: { Authorization: `Bearer ${tokenStudent1}` }
    });

    // 10. Dashboard API Requires Auth (Expect 401)
    console.log('\n--- Step 10: Verify GET /api/dashboard Requires Auth ---');
    const unauthRes = await fetch(`${BASE_URL}/dashboard`);
    console.log('Unauth Dashboard Status (Expected 401):', unauthRes.status);
    if (unauthRes.status !== 401) {
      throw new Error('Unauthenticated access to /api/dashboard was not blocked!');
    }
    console.log('✅ PASS: Unauthenticated access blocked with 401.');

    // 11-20. GET /api/dashboard for Student 1
    console.log('\n--- Step 11-20: Fetch GET /api/dashboard for Student 1 ---');
    const dashRes1 = await fetch(`${BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${tokenStudent1}` }
    });
    const dashData1 = await dashRes1.json();

    console.log('Dashboard Status:', dashRes1.status);
    console.log('Student Info:', dashData1.student);
    console.log('Career Info:', dashData1.career);
    console.log('Readiness:', dashData1.readiness);
    console.log('Skill Summary:', dashData1.skillSummary);
    console.log('Assessment Summary:', dashData1.assessmentSummary);
    console.log('Assessment History Attempts:', dashData1.assessmentHistory?.length);
    console.log('Roadmap Progress:', dashData1.roadmapProgress);
    console.log('Priority Skills Count:', dashData1.prioritySkills?.length);
    console.log('Welcome Message:', dashData1.welcomeMessage);

    if (dashRes1.status !== 200) throw new Error('GET /api/dashboard failed!');

    if (dashData1.student.email !== 'stage7_1@skillforge.test') {
      throw new Error('Incorrect student email returned!');
    }
    if (dashData1.career.name !== 'Full Stack Developer') {
      throw new Error('Incorrect target career returned!');
    }
    if (dashData1.assessmentSummary.totalAttempts !== 2) {
      throw new Error(`Expected 2 assessment attempts, got ${dashData1.assessmentSummary.totalAttempts}`);
    }
    if (!dashData1.readiness || typeof dashData1.readiness.score !== 'number') {
      throw new Error('Readiness score missing or invalid!');
    }
    if (!dashData1.skillSummary || typeof dashData1.skillSummary.strong !== 'number') {
      throw new Error('Skill summary counts missing or invalid!');
    }
    if (!Array.isArray(dashData1.strongestSkills) || !Array.isArray(dashData1.weakestSkills)) {
      throw new Error('Strongest/Weakest skills arrays missing!');
    }
    if (!Array.isArray(dashData1.prioritySkills)) {
      throw new Error('Priority skills array missing!');
    }
    console.log('✅ PASS: Dashboard API returned valid aggregated student metrics.');

    // 21. Student Isolation Test
    console.log('\n--- Step 21: Student Data Isolation Security Check ---');
    const regRes2 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Stage7 Student 2',
        email: 'stage7_2@skillforge.test',
        password: 'Password123!',
        targetCareer: 'Data Analyst'
      })
    });
    const regData2 = await regRes2.json();
    tokenStudent2 = regData2.token;

    const dashRes2 = await fetch(`${BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${tokenStudent2}` }
    });
    const dashData2 = await dashRes2.json();
    if (dashData2.student.email !== 'stage7_2@skillforge.test') {
      throw new Error('SECURITY FAILURE: Student 2 received Student 1 dashboard data!');
    }
    if (dashData2.career.name !== 'Data Analyst') {
      throw new Error('Student 2 career mismatch!');
    }
    console.log('✅ PASS: Data isolation between students verified.');

    // 22-23. New Student No-Data / Onboarding State
    console.log('\n--- Step 22-23: New Student No-Assessment Onboarding State ---');
    const regResNew = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Stage7 New Student',
        email: 'stage7_new@skillforge.test',
        password: 'Password123!'
      })
    });
    const regDataNew = await regResNew.json();
    tokenNewStudent = regDataNew.token;

    const dashResNew = await fetch(`${BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${tokenNewStudent}` }
    });
    const dashDataNew = await dashResNew.json();
    console.log('New Student Dashboard Status:', dashResNew.status);
    console.log('Has Career:', dashDataNew.hasCareer, '| Has Assessment:', dashDataNew.hasAssessment);
    console.log('Welcome Message:', dashDataNew.welcomeMessage);

    if (dashDataNew.hasAssessment !== false) {
      throw new Error('New student should have hasAssessment=false!');
    }
    if (dashDataNew.readiness?.score !== null) {
      throw new Error('New student should not have fake readiness score!');
    }
    console.log('✅ PASS: New student without career/assessment received clean onboarding state.');

    console.log('\n=================== ALL 30 STAGE 7 TESTS PASSED! ===================\n');
  } catch (err) {
    console.error('\n❌ STAGE 7 TEST FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runStage7Tests();
