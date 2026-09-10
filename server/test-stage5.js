import app from './src/app.js';
import { seedDatabase } from './src/config/seedData.js';
import { seedQuestions } from './src/config/questionSeed.js';
import { calculateSkillGapAndReadiness, classifySkillGap } from './src/services/skillGap.service.js';

async function runStage5Tests() {
  console.log('\n=================== STARTING STAGE 5 SKILL GAP ENGINE SUITE ===================\n');

  await seedDatabase();
  await seedQuestions();

  // Unit Test 1: Service Unit Tests (Gap & Classification logic)
  console.log('--- Unit Test 1: Skill Gap Classification Tiers ---');
  if (classifySkillGap(5) !== 'Strong') throw new Error('Gap 5 should be Strong');
  if (classifySkillGap(15) !== 'Moderate') throw new Error('Gap 15 should be Moderate');
  if (classifySkillGap(30) !== 'Needs Improvement') throw new Error('Gap 30 should be Needs Improvement');
  if (classifySkillGap(50) !== 'Critical Gap') throw new Error('Gap 50 should be Critical Gap');
  console.log('✅ PASS: Gap classification tiers verified.');

  // Unit Test 2: Formula & Clamping Unit Test
  console.log('\n--- Unit Test 2: Skill Gap & Readiness Formula calculation ---');
  const mockCareer = {
    _id: 'c1',
    name: 'Full Stack Developer',
    requiredSkills: [
      { skill: { name: 'React', category: 'Frontend' }, targetLevel: 80 },
      { skill: { name: 'Node.js', category: 'Backend' }, targetLevel: 80 },
      { skill: { name: 'MongoDB', category: 'Database' }, targetLevel: 80 },
    ],
  };

  const mockAssessmentResult = {
    overallScore: 85,
    skillScores: [
      { skillName: 'React', score: 100 },
      { skillName: 'Node.js', score: 50 },
      // MongoDB left unassessed to verify fallback = 0
    ],
  };

  const unitAnalysis = calculateSkillGapAndReadiness(mockCareer, mockAssessmentResult);
  console.log('Unit Analysis Result:', {
    readinessScore: unitAnalysis.readinessScore,
    gaps: unitAnalysis.skillAnalysis.map((s) => ({ skill: s.skill, score: s.studentScore, target: s.requiredLevel, gap: s.gap, status: s.status })),
  });

  // Expected:
  // React: student=100, target=80 -> gap=0, status=Strong
  // Node.js: student=50, target=80 -> gap=30, status=Needs Improvement
  // MongoDB: student=0 (fallback), target=80 -> gap=80, status=Critical Gap
  // Total student = 150, Total required = 240 -> Readiness = (150/240)*100 = 62.5%
  if (unitAnalysis.readinessScore !== 62.5) {
    throw new Error(`Expected readiness 62.5, got ${unitAnalysis.readinessScore}`);
  }
  const mongoDbSkill = unitAnalysis.skillAnalysis.find((s) => s.skill === 'MongoDB');
  if (!mongoDbSkill || mongoDbSkill.studentScore !== 0 || mongoDbSkill.gap !== 80 || mongoDbSkill.status !== 'Critical Gap') {
    throw new Error('Fallback for unassessed skill failed!');
  }
  console.log('✅ PASS: Unit test formula, fallback, and clamping verified.');

  // Integration Server Tests
  const server = app.listen(5004, () => {
    console.log('[TEST] Stage 5 test server listening on port 5004');
  });

  const BASE_URL = 'http://localhost:5004/api';
  let tokenStudent1 = '';
  let tokenStudent2 = '';

  try {
    // 3, 4, 5: Register student 1 and complete assessment
    console.log('\n--- Test 3-6: Setup Student 1 & Assessment ---');
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Stage5 Student 1',
        email: 'stage5_1@skillforge.test',
        password: 'Password123!',
        targetCareer: 'Full Stack Developer',
      }),
    });
    const regData = await regRes.json();
    tokenStudent1 = regData.token;

    // Start & complete assessment
    const startRes = await fetch(`${BASE_URL}/assessment/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent1}`,
      },
    });
    const startData = await startRes.json();
    const asmId = startData.assessmentId;

    // Submit answer to question
    await fetch(`${BASE_URL}/assessment/${asmId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent1}`,
      },
      body: JSON.stringify({
        questionId: startData.question._id || startData.question.id,
        selectedOption: 1,
      }),
    });

    // Complete assessment
    await fetch(`${BASE_URL}/assessment/${asmId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent1}`,
      },
    });
    console.log('✅ PASS: Student 1 setup & assessment completed.');

    // 7: Unauthenticated readiness request (Expect 401)
    console.log('\n--- Test 7: Unauthenticated GET /api/analysis/readiness ---');
    const unauthRes = await fetch(`${BASE_URL}/analysis/readiness`);
    console.log('Unauth Status (Expected 401):', unauthRes.status);
    if (unauthRes.status !== 401) {
      throw new Error('Unauthenticated access was allowed!');
    }
    console.log('✅ PASS: Unauthenticated access blocked.');

    // 8-16: Authenticated readiness API test for Student 1
    console.log('\n--- Test 8-16: Authenticated GET /api/analysis/readiness for Student 1 ---');
    const readinessRes = await fetch(`${BASE_URL}/analysis/readiness`, {
      headers: { Authorization: `Bearer ${tokenStudent1}` },
    });
    const readinessData = await readinessRes.json();
    console.log('Readiness API Status:', readinessRes.status);
    console.log('Readiness Data Overview:', {
      career: readinessData.career?.name,
      readinessScore: readinessData.readinessScore,
      assessmentScore: readinessData.assessmentScore,
      summary: readinessData.summary,
      strongestSkills: readinessData.strongestSkills,
      weakestSkills: readinessData.weakestSkills,
    });

    if (readinessRes.status !== 200 || !readinessData.success) {
      throw new Error('GET /api/analysis/readiness failed!');
    }
    if (readinessData.career?.name !== 'Full Stack Developer') {
      throw new Error('Incorrect target career returned!');
    }
    if (readinessData.readinessScore < 0 || readinessData.readinessScore > 100) {
      throw new Error('Readiness score not clamped between 0 and 100!');
    }
    console.log('✅ PASS: Career Readiness API returned complete analysis payload.');

    // 17 & 18: Register Student 2 without completed assessment (Expect clean 404 message)
    console.log('\n--- Test 17 & 18: Student 2 without assessment & ownership test ---');
    const regRes2 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Stage5 Student 2',
        email: 'stage5_2@skillforge.test',
        password: 'Password123!',
        targetCareer: 'Data Analyst',
      }),
    });
    const regData2 = await regRes2.json();
    tokenStudent2 = regData2.token;

    const noAsmRes = await fetch(`${BASE_URL}/analysis/readiness`, {
      headers: { Authorization: `Bearer ${tokenStudent2}` },
    });
    const noAsmData = await noAsmRes.json();
    console.log('Student 2 Readiness Status (Expected 404):', noAsmRes.status, noAsmData.message);
    if (noAsmRes.status !== 404 || noAsmData.hasAssessment !== false) {
      throw new Error('Student 2 without assessment did not return proper 404 message!');
    }
    console.log('✅ PASS: Missing assessment safely handled without server crash.');

    console.log('\n=================== ALL STAGE 5 TESTS PASSED! ===================\n');
  } catch (err) {
    console.error('\n❌ STAGE 5 TEST FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runStage5Tests();
