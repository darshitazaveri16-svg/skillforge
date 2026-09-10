import app from './src/app.js';
import { seedDatabase } from './src/config/seedData.js';
import { seedQuestions } from './src/config/questionSeed.js';
import { generateRoadmapItems } from './src/services/roadmap.service.js';

async function runStage6Tests() {
  console.log('\n=================== STARTING STAGE 6 PERSONALIZED ROADMAP SUITE ===================\n');

  await seedDatabase();
  await seedQuestions();

  // Unit Test 1: Priority Sorting Service Unit Test
  console.log('--- Unit Test 1: Priority Sorting & Gap Ordering ---');
  const mockSkillAnalysis = [
    { skill: 'React', category: 'Frontend', studentScore: 90, requiredLevel: 80, gap: 0, status: 'Strong' },
    { skill: 'MongoDB', category: 'Database', studentScore: 0, requiredLevel: 80, gap: 80, status: 'Critical Gap' },
    { skill: 'Node.js', category: 'Backend', studentScore: 50, requiredLevel: 80, gap: 30, status: 'Needs Improvement' },
    { skill: 'Express.js', category: 'Backend', studentScore: 60, requiredLevel: 80, gap: 20, status: 'Moderate' },
    { skill: 'SQL', category: 'Database', studentScore: 20, requiredLevel: 90, gap: 70, status: 'Critical Gap' },
  ];

  const generatedItems = generateRoadmapItems(mockSkillAnalysis);
  console.log('Generated Items Order:', generatedItems.map((i) => ({ order: i.order, skill: i.skill, gap: i.gap, priority: i.priority, resource: i.resourceUrl })));

  // Verify Critical Gaps come first
  if (generatedItems[0].skill !== 'MongoDB' || generatedItems[1].skill !== 'SQL') {
    throw new Error('Critical Gaps were not prioritized first by largest gap!');
  }
  if (generatedItems[2].priority !== 'High' || generatedItems[2].skill !== 'Node.js') {
    throw new Error('Needs Improvement gap was not prioritized next!');
  }
  console.log('✅ PASS: Service priority sorting & gap ordering verified.');

  // Server Integration Tests
  const server = app.listen(5005, () => {
    console.log('[TEST] Stage 6 test server listening on port 5005');
  });

  const BASE_URL = 'http://localhost:5005/api';
  let tokenStudent1 = '';
  let tokenStudent2 = '';

  try {
    // 3, 4, 5: Register student 1 and complete assessment
    console.log('\n--- Setup Student 1 & Assessment ---');
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Stage6 Student 1',
        email: 'stage6_1@skillforge.test',
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

    await fetch(`${BASE_URL}/assessment/${asmId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent1}`,
      },
    });
    console.log('✅ PASS: Student 1 setup & assessment completed.');

    // 7: Unauthenticated roadmap request (Expect 401)
    console.log('\n--- Test 7: Unauthenticated GET /api/roadmap ---');
    const unauthRes = await fetch(`${BASE_URL}/roadmap`);
    console.log('Unauth Status (Expected 401):', unauthRes.status);
    if (unauthRes.status !== 401) throw new Error('Unauthenticated roadmap access allowed!');
    console.log('✅ PASS: Unauthenticated access blocked.');

    // 8-17: Authenticated GET /api/roadmap
    console.log('\n--- Test 8-17: GET /api/roadmap for Student 1 ---');
    const getRdmRes = await fetch(`${BASE_URL}/roadmap`, {
      headers: { Authorization: `Bearer ${tokenStudent1}` },
    });
    const getRdmData = await getRdmRes.json();
    console.log('Get Roadmap Status:', getRdmRes.status);
    console.log('Roadmap Summary:', {
      careerName: getRdmData.data?.careerName,
      readinessScore: getRdmData.data?.readinessScore,
      itemsCount: getRdmData.data?.items?.length,
      progress: getRdmData.data?.progress,
    });

    if (getRdmRes.status !== 200 || !getRdmData.success || !getRdmData.data) {
      throw new Error('GET /api/roadmap failed!');
    }
    const targetItem = getRdmData.data.items[0];
    const targetItemId = targetItem.itemId || targetItem._id;

    // 19 & 20: Mark item complete (PATCH /api/roadmap/items/:itemId)
    console.log('\n--- Test 19 & 20: Mark item complete & verify progress persistence ---');
    const patchRes1 = await fetch(`${BASE_URL}/roadmap/items/${targetItemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent1}`,
      },
      body: JSON.stringify({ completed: true }),
    });
    const patchData1 = await patchRes1.json();
    console.log('Patch 1 Progress:', patchData1.data?.progress, '%');
    if (patchRes1.status !== 200 || patchData1.data.progress === 0) {
      throw new Error('Item completion failed or progress did not update!');
    }
    console.log('✅ PASS: Item completed and progress updated.');

    // Verify persistence on GET /api/roadmap reload
    const reloadRes = await fetch(`${BASE_URL}/roadmap`, {
      headers: { Authorization: `Bearer ${tokenStudent1}` },
    });
    const reloadData = await reloadRes.json();
    if (reloadData.data.progress === 0) {
      throw new Error('Completion status failed to persist on reload!');
    }
    console.log('✅ PASS: Progress persisted on reload:', reloadData.data.progress, '%');

    // 21: Mark item incomplete
    console.log('\n--- Test 21: Mark item incomplete ---');
    const patchRes2 = await fetch(`${BASE_URL}/roadmap/items/${targetItemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent1}`,
      },
      body: JSON.stringify({ completed: false }),
    });
    const patchData2 = await patchRes2.json();
    console.log('Patch 2 Progress:', patchData2.data?.progress, '%');
    if (patchData2.data.progress !== 0) {
      throw new Error('Item unchecking failed!');
    }
    console.log('✅ PASS: Item marked incomplete & progress reset.');

    // 18 & 22-23: Register Student 2 without assessment (Expect 404) & ownership security
    console.log('\n--- Test 18 & 22-23: Student 2 isolation & missing assessment test ---');
    const regRes2 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Stage6 Student 2',
        email: 'stage6_2@skillforge.test',
        password: 'Password123!',
        targetCareer: 'Data Analyst',
      }),
    });
    const regData2 = await regRes2.json();
    tokenStudent2 = regData2.token;

    const noAsmRdm = await fetch(`${BASE_URL}/roadmap`, {
      headers: { Authorization: `Bearer ${tokenStudent2}` },
    });
    console.log('Student 2 Roadmap Status (Expected 404):', noAsmRdm.status);
    if (noAsmRdm.status !== 404) {
      throw new Error('Student without assessment should receive 404 message!');
    }
    console.log('✅ PASS: Student 2 without assessment handled safely.');

    // Student 2 attempts to toggle Student 1's roadmap item (Expect 404/403)
    const badToggle = await fetch(`${BASE_URL}/roadmap/items/${targetItemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent2}`,
      },
      body: JSON.stringify({ completed: true }),
    });
    console.log('Cross-student item toggle status (Expected 404/403):', badToggle.status);
    if (badToggle.status !== 404 && badToggle.status !== 403) {
      throw new Error('SECURITY VIOLATION: Student 2 modified Student 1 roadmap item!');
    }
    console.log('✅ PASS: Cross-student roadmap modification blocked.');

    // 24: Test Roadmap Regeneration
    console.log('\n--- Test 24: Test POST /api/roadmap/generate ---');
    const genRes = await fetch(`${BASE_URL}/roadmap/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent1}`,
      },
    });
    const genData = await genRes.json();
    console.log('Regenerate Status:', genRes.status, genData.message);
    if (genRes.status !== 200 || !genData.success) {
      throw new Error('Roadmap regeneration failed!');
    }
    console.log('✅ PASS: Roadmap regenerated dynamically.');

    console.log('\n=================== ALL STAGE 6 TESTS PASSED! ===================\n');
  } catch (err) {
    console.error('\n❌ STAGE 6 TEST FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runStage6Tests();
