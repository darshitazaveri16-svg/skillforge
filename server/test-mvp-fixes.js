import app from './src/app.js';
import { seedDatabase } from './src/config/seedData.js';
import { seedQuestions } from './src/config/questionSeed.js';

async function runMvpFixesTests() {
  console.log('\n=================== STARTING TARGETED MVP UX + FUNCTIONALITY TEST SUITE ===================\n');

  await seedDatabase();
  await seedQuestions();

  const PORT = 5010;
  const server = app.listen(PORT, () => {
    console.log(`[TEST] MVP test server listening on port ${PORT}`);
  });

  const BASE_URL = `http://localhost:${PORT}/api`;
  let passCount = 0;
  let failCount = 0;

  function assert(condition, message) {
    if (!condition) {
      failCount++;
      console.error(`❌ FAIL: ${message}`);
      throw new Error(message);
    }
    passCount++;
    console.log(`✅ PASS: ${message}`);
  }

  try {
    // ----------------------------------------------------
    // TEST 1 — Registration without Career Field
    // ----------------------------------------------------
    console.log('\n--- TEST 1 — Registration without Career Field ---');
    const regRes1 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New Student Alpha',
        email: 'alpha@skillforge.test',
        password: 'Password123!',
      }),
    });
    const regData1 = await regRes1.json();
    assert(regRes1.status === 201, 'Registration returns 201 Created');
    assert(Boolean(regData1.token), 'Registration returns auth token');
    assert(regData1.user.targetCareerRef === null || regData1.user.targetCareerRef === undefined, 'New user targetCareerRef is null');
    const tokenAlpha = regData1.token;

    // ----------------------------------------------------
    // TEST 9 — Assessment without Career
    // ----------------------------------------------------
    console.log('\n--- TEST 9 — Assessment without Career ---');
    const startNoCareerRes = await fetch(`${BASE_URL}/assessment/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAlpha}`,
      },
    });
    const startNoCareerData = await startNoCareerRes.json();
    assert(startNoCareerRes.status === 400, 'Assessment without career returns 400 Bad Request');
    assert(startNoCareerData.success === false, 'Assessment without career response success is false');
    assert(
      startNoCareerData.message.includes('select a target career'),
      `Error message guides user to select career: "${startNoCareerData.message}"`
    );

    // ----------------------------------------------------
    // TEST 2 — Career Onboarding
    // ----------------------------------------------------
    console.log('\n--- TEST 2 — Career Onboarding ---');
    const updateCareerRes = await fetch(`${BASE_URL}/auth/profile/career`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAlpha}`,
      },
      body: JSON.stringify({ careerName: 'Data Analyst' }),
    });
    const updateCareerData = await updateCareerRes.json();
    assert(updateCareerRes.status === 200, 'Career selection returns 200 OK');
    assert(updateCareerData.user.targetCareer === 'Data Analyst', 'Target career set to Data Analyst');
    assert(Boolean(updateCareerData.user.targetCareerRef), 'Target career reference is stored');

    // ----------------------------------------------------
    // TEST 3 — Data Analyst Assessment
    // ----------------------------------------------------
    console.log('\n--- TEST 3 — Data Analyst Assessment ---');
    const daStartRes = await fetch(`${BASE_URL}/assessment/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAlpha}`,
      },
    });
    const daStartData = await daStartRes.json();
    assert(daStartRes.status === 201, 'Data Analyst assessment starts with 201');
    assert(daStartData.careerName === 'Data Analyst', 'Assessment confirmed for Data Analyst track');
    
    const daSkills = ['Python', 'SQL', 'Excel', 'Statistics', 'Pandas', 'NumPy', 'Data Visualization', 'Power BI'];
    assert(
      daSkills.includes(daStartData.question.skillName),
      `First question skill "${daStartData.question.skillName}" belongs to Data Analyst skills: [${daSkills.join(', ')}]`
    );
    const nonDaSkills = ['React', 'Node.js', 'Express.js', 'HTML', 'CSS', 'MongoDB', 'Networking', 'Linux'];
    assert(
      !nonDaSkills.includes(daStartData.question.skillName),
      `First question is NOT a Full Stack or Security skill (got: ${daStartData.question.skillName})`
    );

    // ----------------------------------------------------
    // TEST 4 — Full Stack Assessment
    // ----------------------------------------------------
    console.log('\n--- TEST 4 — Full Stack Assessment ---');
    const regFs = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'FullStack Student',
        email: 'fullstack@skillforge.test',
        password: 'Password123!',
      }),
    });
    const tokenFs = (await regFs.json()).token;
    await fetch(`${BASE_URL}/auth/profile/career`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFs}` },
      body: JSON.stringify({ careerName: 'Full Stack Developer' }),
    });

    const fsStartRes = await fetch(`${BASE_URL}/assessment/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFs}` },
    });
    const fsStartData = await fsStartRes.json();
    const fsSkills = ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Git'];
    assert(
      fsSkills.includes(fsStartData.question.skillName),
      `Full Stack question skill "${fsStartData.question.skillName}" belongs to Full Stack skills: [${fsSkills.join(', ')}]`
    );

    // ----------------------------------------------------
    // TEST 5 — Python Developer Assessment
    // ----------------------------------------------------
    console.log('\n--- TEST 5 — Python Developer Assessment ---');
    const regPy = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Python Student',
        email: 'python@skillforge.test',
        password: 'Password123!',
      }),
    });
    const tokenPy = (await regPy.json()).token;
    await fetch(`${BASE_URL}/auth/profile/career`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenPy}` },
      body: JSON.stringify({ careerName: 'Python Developer' }),
    });

    const pyStartRes = await fetch(`${BASE_URL}/assessment/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenPy}` },
    });
    const pyStartData = await pyStartRes.json();
    const pySkills = ['Python', 'OOP', 'SQL', 'Git', 'REST APIs', 'Flask', 'Django', 'Testing'];
    assert(
      pySkills.includes(pyStartData.question.skillName),
      `Python Dev question skill "${pyStartData.question.skillName}" belongs to Python Developer skills: [${pySkills.join(', ')}]`
    );

    // ----------------------------------------------------
    // TEST 6 — Cybersecurity Assessment
    // ----------------------------------------------------
    console.log('\n--- TEST 6 — Cybersecurity Assessment ---');
    const regSec = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Cyber Student',
        email: 'cyber@skillforge.test',
        password: 'Password123!',
      }),
    });
    const tokenSec = (await regSec.json()).token;
    await fetch(`${BASE_URL}/auth/profile/career`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenSec}` },
      body: JSON.stringify({ careerName: 'Cybersecurity Analyst' }),
    });

    const secStartRes = await fetch(`${BASE_URL}/assessment/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenSec}` },
    });
    const secStartData = await secStartRes.json();
    const secSkills = ['Networking', 'Linux', 'Cybersecurity Fundamentals', 'SIEM', 'Threat Detection', 'Cryptography', 'Vulnerability Assessment', 'Python'];
    assert(
      secSkills.includes(secStartData.question.skillName),
      `Cybersecurity question skill "${secStartData.question.skillName}" belongs to Cybersecurity skills: [${secSkills.join(', ')}]`
    );

    // ----------------------------------------------------
    // TEST 7 — Existing User with Career
    // ----------------------------------------------------
    console.log('\n--- TEST 7 — Existing User with Career ---');
    const loginExistingRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alpha@skillforge.test',
        password: 'Password123!',
      }),
    });
    const loginExistingData = await loginExistingRes.json();
    assert(loginExistingRes.status === 200, 'Login succeeded for existing user');
    assert(Boolean(loginExistingData.user.targetCareerRef), 'Existing user has targetCareerRef (goes directly to dashboard)');
    assert(loginExistingData.user.targetCareer === 'Data Analyst', 'Target career is Data Analyst');

    // ----------------------------------------------------
    // TEST 8 — Existing User Without Career
    // ----------------------------------------------------
    console.log('\n--- TEST 8 — Existing User Without Career ---');
    const regNoCareerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Undecided Student',
        email: 'undecided@skillforge.test',
        password: 'Password123!',
      }),
    });
    const loginUndecidedRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'undecided@skillforge.test',
        password: 'Password123!',
      }),
    });
    const loginUndecidedData = await loginUndecidedRes.json();
    assert(
      loginUndecidedData.user.targetCareerRef === null || loginUndecidedData.user.targetCareerRef === undefined,
      'User without career has null targetCareerRef (routes to onboarding)'
    );

    // ----------------------------------------------------
    // TEST 10 — Assessment Scoring & Adaptive Flow
    // ----------------------------------------------------
    console.log('\n--- TEST 10 — Assessment Scoring & Adaptive Flow ---');
    const daAsmId = daStartData.assessmentId;
    const firstQ = daStartData.question;
    
    // Submit 1st answer
    const sub1Res = await fetch(`${BASE_URL}/assessment/${daAsmId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenAlpha}` },
      body: JSON.stringify({
        questionId: firstQ._id || firstQ.id,
        selectedOption: 1,
      }),
    });
    const sub1Data = await sub1Res.json();
    assert(sub1Res.status === 200, 'Answer 1 submitted successfully');
    assert(sub1Data.isCorrect !== undefined, 'isCorrect feedback returned');
    assert(Boolean(sub1Data.explanation), 'Explanation returned');

    // Complete assessment
    const completeRes = await fetch(`${BASE_URL}/assessment/${daAsmId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenAlpha}` },
    });
    const completeData = await completeRes.json();
    assert(completeRes.status === 200, 'Assessment completed successfully');
    assert(completeData.result.overallScore !== undefined, 'Overall score computed');
    assert(Array.isArray(completeData.result.skillScores), 'Skill-wise breakdown computed');

    // History check
    const histRes = await fetch(`${BASE_URL}/assessment/history`, {
      headers: { Authorization: `Bearer ${tokenAlpha}` },
    });
    const histData = await histRes.json();
    assert(histRes.status === 200, 'Assessment history retrieved');
    assert(histData.count >= 1, 'Assessment history has at least 1 attempt');

    // ----------------------------------------------------
    // TEST 11 — Skill Gap Engine
    // ----------------------------------------------------
    console.log('\n--- TEST 11 — Skill Gap Engine ---');
    const readinessRes = await fetch(`${BASE_URL}/analysis/readiness`, {
      headers: { Authorization: `Bearer ${tokenAlpha}` },
    });
    const readinessData = await readinessRes.json();
    assert(readinessRes.status === 200, 'Readiness analysis returned 200');
    assert(readinessData.readinessScore !== undefined, 'Readiness score calculated');
    assert(
      (readinessData.career.name || readinessData.career) === 'Data Analyst',
      `Readiness analysis matches student career (${readinessData.career.name || readinessData.career})`
    );
    assert(Array.isArray(readinessData.skillAnalysis), 'Skill analysis array present');

    // ----------------------------------------------------
    // TEST 12 — Roadmap Generation
    // ----------------------------------------------------
    console.log('\n--- TEST 12 — Roadmap Generation ---');
    const roadmapRes = await fetch(`${BASE_URL}/roadmap`, {
      headers: { Authorization: `Bearer ${tokenAlpha}` },
    });
    const roadmapData = await roadmapRes.json();
    assert(roadmapRes.status === 200, 'Roadmap returned 200');
    assert(roadmapData.data.careerName === 'Data Analyst', 'Roadmap reflects student career');
    assert(Array.isArray(roadmapData.data.items) && roadmapData.data.items.length > 0, 'Roadmap items generated from skill gaps');

    // ----------------------------------------------------
    // TEST 13 — Dashboard Integration
    // ----------------------------------------------------
    console.log('\n--- TEST 13 — Dashboard Integration ---');
    const dashRes = await fetch(`${BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${tokenAlpha}` },
    });
    const dashData = await dashRes.json();
    assert(dashRes.status === 200, 'Dashboard returned 200');
    assert(dashData.hasCareer === true, 'Dashboard hasCareer is true');
    assert(dashData.hasAssessment === true, 'Dashboard hasAssessment is true');
    assert(dashData.career.name === 'Data Analyst', 'Dashboard career is Data Analyst');
    assert(dashData.readiness.score !== null, 'Dashboard has calculated readiness score');

    // ----------------------------------------------------
    // TEST 14 — Authentication Regression (/me, etc.)
    // ----------------------------------------------------
    console.log('\n--- TEST 14 — Authentication Regression ---');
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${tokenAlpha}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, 'GET /api/auth/me returned 200');
    assert(meData.user.email === 'alpha@skillforge.test', 'Authenticated user profile is accurate');
    assert(meData.user.targetCareer === 'Data Analyst', 'Authenticated profile has correct career');

    // ----------------------------------------------------
    // TEST 15 — Student Data Isolation
    // ----------------------------------------------------
    console.log('\n--- TEST 15 — Student Data Isolation ---');
    const dashAlpha = dashData;
    const dashFsRes = await fetch(`${BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${tokenFs}` },
    });
    const dashFs = await dashFsRes.json();
    assert(dashAlpha.student.email !== dashFs.student.email, 'Student emails are isolated');
    assert(dashAlpha.career.name !== dashFs.career.name, 'Student careers are isolated (Data Analyst vs Full Stack)');
    assert(dashFs.hasAssessment === false, 'Student B has not completed assessment and data is isolated');

    console.log(`\n=================== ALL ${passCount} MVP TESTS PASSED! (${failCount} failed) ===================\n`);
  } catch (err) {
    console.error('\n❌ MVP TEST SUITE ERROR:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runMvpFixesTests();
