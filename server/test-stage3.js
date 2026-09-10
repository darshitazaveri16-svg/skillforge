import mongoose from 'mongoose';
import app from './src/app.js';
import { seedDatabase, inMemoryStore } from './src/config/seedData.js';

async function runStage3Tests() {
  console.log('\n=================== STARTING STAGE 3 CAREER & SKILL SUITE ===================\n');

  // Trigger seeding
  await seedDatabase();

  const server = app.listen(5002, () => {
    console.log('[TEST] Stage 3 test server listening on port 5002');
  });

  const BASE_URL = 'http://localhost:5002/api';
  let token = '';
  let sampleCareerId = '';

  try {
    // 1 & 2 & 6: Test GET /api/careers
    console.log('--- Test 1-6: GET /api/careers ---');
    const careersRes = await fetch(`${BASE_URL}/careers`);
    const careersData = await careersRes.json();
    console.log('Careers Status:', careersRes.status, `Count: ${careersData.count}`);
    if (careersRes.status !== 200 || !careersData.success || careersData.data.length < 4) {
      throw new Error(`Expected at least 4 careers, got ${careersData.count}`);
    }
    console.log('✅ PASS: All 4 careers seeded & returned from GET /api/careers.');

    const careerNames = careersData.data.map(c => c.name);
    console.log('Seeded Careers:', careerNames);
    sampleCareerId = careersData.data[0]._id || careersData.data[0].id;

    // 8: Test GET /api/skills
    console.log('\n--- Test 8: GET /api/skills ---');
    const skillsRes = await fetch(`${BASE_URL}/skills`);
    const skillsData = await skillsRes.json();
    console.log('Skills Status:', skillsRes.status, `Count: ${skillsData.count}`);
    if (skillsRes.status !== 200 || !skillsData.success || skillsData.data.length === 0) {
      throw new Error('Skills API failed or returned zero items!');
    }
    console.log('✅ PASS: Skills exist in database/store.');

    // 7: Test GET /api/careers/:id
    console.log('\n--- Test 7: GET /api/careers/:id ---');
    const singleCareerRes = await fetch(`${BASE_URL}/careers/${sampleCareerId}`);
    const singleCareerData = await singleCareerRes.json();
    console.log('Single Career Status:', singleCareerRes.status, `Name: ${singleCareerData.data?.name}`);
    if (singleCareerRes.status !== 200 || !singleCareerData.data) {
      throw new Error('GET /api/careers/:id failed!');
    }
    console.log('✅ PASS: GET /api/careers/:id returned career details.');

    // 9 & 5: Test GET /api/careers/:id/skills
    console.log('\n--- Test 5 & 9: GET /api/careers/:id/skills ---');
    const careerSkillsRes = await fetch(`${BASE_URL}/careers/${sampleCareerId}/skills`);
    const careerSkillsData = await careerSkillsRes.json();
    console.log('Career Skills Status:', careerSkillsRes.status, `Skills Count: ${careerSkillsData.count}`);
    if (careerSkillsRes.status !== 200 || !careerSkillsData.data || careerSkillsData.data.length === 0) {
      throw new Error('GET /api/careers/:id/skills failed!');
    }
    console.log('✅ PASS: Career-skill relationships populated correctly.');

    // 16: Register student and get token
    console.log('\n--- Test 16: Authentication regression check ---');
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Stage 3 Tester',
        email: 'stage3@skillforge.test',
        password: 'Password123!',
        targetCareer: 'Full Stack Developer',
      }),
    });
    const regData = await regRes.json();
    if (!regData.token) throw new Error('Registration failed in Stage 3 tests');
    token = regData.token;
    console.log('✅ PASS: Existing authentication flow working.');

    // 14: Unauthenticated update attempt (Expect 401)
    console.log('\n--- Test 14: Unauthenticated PUT /api/auth/profile/career ---');
    const unauthPut = await fetch(`${BASE_URL}/auth/profile/career`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ careerName: 'Data Analyst' }),
    });
    console.log('Unauth Update Status (Expected 401):', unauthPut.status);
    if (unauthPut.status !== 401) {
      throw new Error('Unauthenticated profile update was allowed!');
    }
    console.log('✅ PASS: Unauthenticated career update blocked.');

    // 15: Invalid career ID attempt (Expect 404 or 400)
    console.log('\n--- Test 15: Invalid career ID check ---');
    const badCareerPut = await fetch(`${BASE_URL}/auth/profile/career`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ careerName: 'NonExistentQuantumEngineer' }),
    });
    console.log('Invalid Career Status (Expected 404):', badCareerPut.status);
    if (badCareerPut.status !== 404 && badCareerPut.status !== 400) {
      throw new Error('Invalid career name was not handled correctly!');
    }
    console.log('✅ PASS: Invalid career selection handled cleanly.');

    // 10 & 11: Authenticated student updates target career
    console.log('\n--- Test 10 & 11: Student selects a new target career ---');
    const targetCareerToSet = 'Data Analyst';
    const updateRes = await fetch(`${BASE_URL}/auth/profile/career`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ careerName: targetCareerToSet }),
    });
    const updateData = await updateRes.json();
    console.log('Update Status:', updateRes.status, updateData.message);
    if (updateRes.status !== 200 || updateData.user.targetCareer !== targetCareerToSet) {
      throw new Error('Failed to update target career!');
    }
    console.log('✅ PASS: Selected career saved to student profile.');

    // 12: Verify career remains after fetching profile (/me)
    console.log('\n--- Test 12: Verify selected career remains on /me fetch ---');
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    if (meData.user.targetCareer !== targetCareerToSet) {
      throw new Error('Target career failed to persist on profile fetch!');
    }
    console.log('✅ PASS: Target career persists on profile reload:', meData.user.targetCareer);

    // 13: Student changes career to another track
    console.log('\n--- Test 13: Student changes career track again ---');
    const newTarget = 'Cybersecurity Analyst';
    const changeRes = await fetch(`${BASE_URL}/auth/profile/career`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ careerName: newTarget }),
    });
    const changeData = await changeRes.json();
    if (changeRes.status !== 200 || changeData.user.targetCareer !== newTarget) {
      throw new Error('Student failed to change career track!');
    }
    console.log('✅ PASS: Student successfully changed target career to:', newTarget);

    console.log('\n=================== ALL STAGE 3 TESTS PASSED! ===================\n');
  } catch (err) {
    console.error('\n❌ STAGE 3 TEST FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runStage3Tests();
