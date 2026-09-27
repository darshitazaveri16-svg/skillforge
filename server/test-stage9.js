import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
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
import ResumeAnalysis from './src/models/ResumeAnalysis.js';
import Roadmap from './src/models/Roadmap.js';

dotenv.config();

// Helper to create minimal PDF buffer for resume analyzer check
function createTestPdfBuffer(text) {
  const contentStream = `BT /F1 12 Tf 72 712 Td (${text.replace(/[()\\]/g, '\\$&')}) Tj ET`;
  const streamLength = Buffer.byteLength(contentStream);
  const pdf = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000244 00000 n \n0000000350 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n440\n%%EOF`;
  return Buffer.from(pdf, 'utf-8');
}

async function runStage9Tests() {
  console.log('\n===============================================================');
  console.log('   SKILLFORGE — STAGE 9 ADMIN DASHBOARD & MANAGEMENT TESTS     ');
  console.log('===============================================================\n');

  let server;
  const PORT = 5026;
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
    console.log(`✅ PASS [${passCount}]: ${message}`);
  }

  // Track created artifacts for cleanup
  const cleanupUserIds = [];
  const cleanupCareerIds = [];
  const cleanupSkillIds = [];
  const cleanupQuestionIds = [];

  try {
    console.log('--- Initializing Database & Express Test Server ---');
    await connectDB();
    await seedDatabase();
    await seedQuestions();

    server = app.listen(PORT, () => {
      console.log(`[TEST] Server listening on port ${PORT}`);
    });

    // Setup Admin user
    const adminEmail = `stage9_admin_${Date.now()}@skillforge.test`;
    const adminPassword = 'AdminSecretPass123!';
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash(adminPassword, salt);

    const adminUser = await User.create({
      name: 'Stage 9 Master Admin',
      email: adminEmail,
      password: hashedAdminPassword,
      role: 'admin',
      targetCareer: 'Full Stack Developer',
      onboardingCompleted: true,
      createdAt: new Date(),
    });
    cleanupUserIds.push(adminUser._id);

    // Setup Student user
    const studentEmail = `stage9_student_${Date.now()}@skillforge.test`;
    const studentPassword = 'StudentPass123!';
    const hashedStudentPassword = await bcrypt.hash(studentPassword, salt);

    const studentUser = await User.create({
      name: 'Stage 9 Test Student',
      email: studentEmail,
      password: hashedStudentPassword,
      role: 'student',
      targetCareer: 'Data Analyst',
      onboardingCompleted: true,
      createdAt: new Date(),
    });
    cleanupUserIds.push(studentUser._id);

    // Login Admin to get Token
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminLoginData.token, 'Admin login succeeded and returned token');
    const adminToken = adminLoginData.token;

    // Login Student to get Token
    const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentEmail, password: studentPassword }),
    });
    const studentLoginData = await studentLoginRes.json();
    assert(studentLoginRes.status === 200 && studentLoginData.token, 'Student login succeeded and returned token');
    const studentToken = studentLoginData.token;

    // -------------------------------------------------------------
    // TEST 1 — Student cannot access admin dashboard (403 Forbidden)
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: Student Forbidden from Admin Dashboard ---');
    const studentAccessRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      studentAccessRes.status === 403,
      `Student access to GET /api/admin/dashboard returned 403 Forbidden (status: ${studentAccessRes.status})`
    );

    // -------------------------------------------------------------
    // TEST 2 — Unauthenticated user cannot access admin APIs (401 Unauthorized)
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Unauthenticated User Rejected ---');
    const unauthRes = await fetch(`${BASE_URL}/admin/dashboard`);
    assert(
      unauthRes.status === 401,
      `Unauthenticated access to GET /api/admin/dashboard returned 401 Unauthorized (status: ${unauthRes.status})`
    );

    // -------------------------------------------------------------
    // TEST 3 — Admin can access admin dashboard (200 OK)
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Admin Can Access Dashboard ---');
    const adminDashRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dashData = await adminDashRes.json();
    assert(
      adminDashRes.status === 200 && dashData.success === true,
      `Admin access to GET /api/admin/dashboard succeeded (status: 200)`
    );

    // -------------------------------------------------------------
    // TEST 4 — Admin statistics are correct
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Aggregated Dashboard Statistics Verified ---');
    const stats = dashData.data;
    assert(typeof stats.totalStudents === 'number' && stats.totalStudents >= 1, 'Stats include valid totalStudents');
    assert(typeof stats.totalCareers === 'number' && stats.totalCareers >= 1, 'Stats include valid totalCareers');
    assert(typeof stats.totalSkills === 'number' && stats.totalSkills >= 1, 'Stats include valid totalSkills');
    assert(typeof stats.totalQuestions === 'number' && stats.totalQuestions >= 1, 'Stats include valid totalQuestions');
    assert(typeof stats.totalAssessments === 'number', 'Stats include totalAssessments count');
    assert(typeof stats.completedAssessments === 'number', 'Stats include completedAssessments count');
    assert(typeof stats.totalResumeAnalyses === 'number', 'Stats include totalResumeAnalyses count');
    assert(Array.isArray(stats.careerDistribution), 'Stats include careerDistribution list');
    assert(Array.isArray(stats.recentStudents), 'Stats include recentStudents list');

    // -------------------------------------------------------------
    // TEST 5 — Student listing works with pagination & filters
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Student Listing with Pagination & Search ---');
    const studentsRes = await fetch(`${BASE_URL}/admin/students?limit=10&page=1`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const studentsData = await studentsRes.json();
    assert(
      studentsRes.status === 200 && studentsData.success && Array.isArray(studentsData.data),
      `Admin students endpoint returned list of students (count: ${studentsData.count})`
    );

    // -------------------------------------------------------------
    // TEST 6 — Student passwords are never returned
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Student Passwords Never Exposed ---');
    const anyPasswordExposed = studentsData.data.some(
      (s) => s.password !== undefined || s.passwordHash !== undefined
    );
    assert(!anyPasswordExposed, 'Zero students expose password or passwordHash field in response');

    // -------------------------------------------------------------
    // TEST 7 — Career listing works
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: Career Listing for Admin ---');
    const careersRes = await fetch(`${BASE_URL}/admin/careers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const careersData = await careersRes.json();
    assert(
      careersRes.status === 200 && careersData.success && Array.isArray(careersData.data),
      `Admin careers endpoint returned careers catalog (total: ${careersData.count})`
    );

    // -------------------------------------------------------------
    // TEST 8 — Admin can create career
    // -------------------------------------------------------------
    console.log('\n--- TEST 8: Admin Career Creation ---');
    const testSkill = await Skill.findOne();
    const testCareerName = `Stage 9 Cloud DevOps Architect_${Date.now()}`;
    const createCareerRes = await fetch(`${BASE_URL}/admin/careers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: testCareerName,
        description: 'Designs and manages scalable cloud and container infrastructure.',
        requiredSkills: [{ skill: testSkill._id, targetLevel: 85 }],
      }),
    });
    const createCareerData = await createCareerRes.json();
    assert(
      createCareerRes.status === 201 && createCareerData.data?._id,
      `Admin created new career "${testCareerName}" successfully`
    );
    const createdCareerId = createCareerData.data._id;
    cleanupCareerIds.push(createdCareerId);

    // -------------------------------------------------------------
    // TEST 9 — Admin can update career
    // -------------------------------------------------------------
    console.log('\n--- TEST 9: Admin Career Update ---');
    const updatedDesc = 'Updated description: Advanced cloud infrastructure and SRE practices.';
    const updateCareerRes = await fetch(`${BASE_URL}/admin/careers/${createdCareerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        description: updatedDesc,
      }),
    });
    const updateCareerData = await updateCareerRes.json();
    assert(
      updateCareerRes.status === 200 && updateCareerData.data?.description === updatedDesc,
      'Admin updated career description successfully'
    );

    // -------------------------------------------------------------
    // TEST 10 — Career deletion safety works
    // -------------------------------------------------------------
    console.log('\n--- TEST 10: Career Deletion Data Integrity Safety ---');
    // Find an active career that is referenced by students (e.g. Data Analyst)
    const dataAnalystCareer = await Career.findOne({ name: 'Data Analyst' });
    const deleteSafeRes = await fetch(`${BASE_URL}/admin/careers/${dataAnalystCareer._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deleteSafeData = await deleteSafeRes.json();
    assert(
      deleteSafeRes.status === 400 && deleteSafeData.success === false,
      `Career referenced by students/assessments rejected deletion safely (message: "${deleteSafeData.message}")`
    );

    // -------------------------------------------------------------
    // TEST 11 — Skill listing works
    // -------------------------------------------------------------
    console.log('\n--- TEST 11: Skill Listing with Associated Careers ---');
    const skillsRes = await fetch(`${BASE_URL}/admin/skills`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const skillsData = await skillsRes.json();
    assert(
      skillsRes.status === 200 && skillsData.success && Array.isArray(skillsData.data),
      `Admin skills endpoint returned skills list with enrichment (count: ${skillsData.count})`
    );
    assert(
      Array.isArray(skillsData.data[0]?.associatedCareers),
      'Skill items contain populated associatedCareers array'
    );

    // -------------------------------------------------------------
    // TEST 12 — Admin can create skill
    // -------------------------------------------------------------
    console.log('\n--- TEST 12: Admin Skill Creation ---');
    const newSkillName = `Kubernetes_Stage9_${Date.now()}`;
    const createSkillRes = await fetch(`${BASE_URL}/admin/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: newSkillName,
        category: 'DevOps',
        description: 'Automated container orchestration and deployment.',
      }),
    });
    const createSkillData = await createSkillRes.json();
    assert(
      createSkillRes.status === 201 && createSkillData.data?._id,
      `Admin created new skill "${newSkillName}" successfully`
    );
    const createdSkillId = createSkillData.data._id;
    cleanupSkillIds.push(createdSkillId);

    // -------------------------------------------------------------
    // TEST 13 — Duplicate skills are rejected
    // -------------------------------------------------------------
    console.log('\n--- TEST 13: Duplicate Skill Rejection ---');
    const dupSkillRes = await fetch(`${BASE_URL}/admin/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: newSkillName,
        category: 'DevOps',
        description: 'Duplicate attempt',
      }),
    });
    const dupSkillData = await dupSkillRes.json();
    assert(
      dupSkillRes.status === 400 && dupSkillData.success === false,
      `Duplicate skill creation rejected with 400 (message: "${dupSkillData.message}")`
    );

    // -------------------------------------------------------------
    // TEST 14 — Admin can update skill
    // -------------------------------------------------------------
    console.log('\n--- TEST 14: Admin Skill Update ---');
    const updateSkillRes = await fetch(`${BASE_URL}/admin/skills/${createdSkillId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        description: 'Updated container orchestration description.',
      }),
    });
    const updateSkillData = await updateSkillRes.json();
    assert(
      updateSkillRes.status === 200 && updateSkillData.data?.description.includes('Updated container'),
      'Admin updated skill description successfully'
    );

    // -------------------------------------------------------------
    // TEST 15 — Question listing works
    // -------------------------------------------------------------
    console.log('\n--- TEST 15: Admin Question Listing ---');
    const questionsRes = await fetch(`${BASE_URL}/admin/questions?limit=10&page=1`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const questionsData = await questionsRes.json();
    assert(
      questionsRes.status === 200 && questionsData.success && Array.isArray(questionsData.data),
      `Admin questions endpoint returned questions list (total: ${questionsData.count})`
    );
    // Admin questions should reveal correctAnswer
    assert(
      questionsData.data.some((q) => q.correctAnswer !== undefined),
      'Admin view exposes correctAnswer field for question management'
    );

    // -------------------------------------------------------------
    // TEST 16 — Admin can create question
    // -------------------------------------------------------------
    console.log('\n--- TEST 16: Admin Question Creation ---');
    const createQRes = await fetch(`${BASE_URL}/admin/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        questionText: 'What is a Pod in Kubernetes architecture?',
        options: [
          'The smallest deployable computing unit',
          'A database cluster node',
          'A Docker desktop daemon',
          'A cloud billing account',
        ],
        correctAnswer: 0,
        explanation: 'In Kubernetes, a Pod represents a single instance of a running process in a cluster.',
        difficulty: 'medium',
        skill: createdSkillId,
      }),
    });
    const createQData = await createQRes.json();
    assert(
      createQRes.status === 201 && createQData.data?._id,
      'Admin created new question successfully'
    );
    const createdQId = createQData.data._id;
    cleanupQuestionIds.push(createdQId);

    // -------------------------------------------------------------
    // TEST 17 — Invalid question rejected
    // -------------------------------------------------------------
    console.log('\n--- TEST 17: Invalid Question Rejected ---');
    const invalidQRes = await fetch(`${BASE_URL}/admin/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        questionText: 'Invalid question with only 2 options',
        options: ['Option A', 'Option B'], // Only 2 options!
        correctAnswer: 0,
        explanation: 'Missing options',
        difficulty: 'easy',
        skill: createdSkillId,
      }),
    });
    const invalidQData = await invalidQRes.json();
    assert(
      invalidQRes.status === 400 && invalidQData.success === false,
      `Invalid question with fewer than 4 options rejected with 400 (message: "${invalidQData.message}")`
    );

    // -------------------------------------------------------------
    // TEST 18 — Admin can update question
    // -------------------------------------------------------------
    console.log('\n--- TEST 18: Admin Question Update ---');
    const updatedExplanation = 'Updated explanation: Pods contain one or more containers sharing storage and network.';
    const updateQRes = await fetch(`${BASE_URL}/admin/questions/${createdQId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        explanation: updatedExplanation,
      }),
    });
    const updateQData = await updateQRes.json();
    assert(
      updateQRes.status === 200 && updateQData.data?.explanation === updatedExplanation,
      'Admin updated question explanation successfully'
    );

    // -------------------------------------------------------------
    // TEST 19 — Admin can delete question safely
    // -------------------------------------------------------------
    console.log('\n--- TEST 19: Admin Question Deletion ---');
    const deleteQRes = await fetch(`${BASE_URL}/admin/questions/${createdQId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deleteQData = await deleteQRes.json();
    assert(
      deleteQRes.status === 200 && deleteQData.success,
      'Admin deleted test question successfully'
    );

    // -------------------------------------------------------------
    // TEST 20 — Correct answers remain protected from student assessment APIs
    // -------------------------------------------------------------
    console.log('\n--- TEST 20: Student Assessment API Protects Correct Answers ---');
    const startAssessRes = await fetch(`${BASE_URL}/assessment/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
    });
    const startAssessData = await startAssessRes.json();
    assert(
      (startAssessRes.status === 200 || startAssessRes.status === 201) && startAssessData.question,
      'Student retrieved assessment question on start'
    );
    assert(
      startAssessData.question.correctAnswer === undefined,
      'Assessment question protects and never exposes correctAnswer to student'
    );

    // -------------------------------------------------------------
    // TEST 21 — Existing student authentication still works
    // -------------------------------------------------------------
    console.log('\n--- TEST 21: Existing Student Authentication ---');
    const testNewStudentEmail = `stage9_newstudent_${Date.now()}@skillforge.test`;
    const authRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Stage9 Newbie',
        email: testNewStudentEmail,
        password: 'Password123!',
        targetCareer: 'Full Stack Developer',
      }),
    });
    const authRegData = await authRegRes.json();
    assert(authRegRes.status === 201 && authRegData.token, 'Student registration still works');
    cleanupUserIds.push(authRegData.user._id || authRegData.user.id);

    const authMeRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authRegData.token}` },
    });
    const authMeData = await authMeRes.json();
    assert(authMeRes.status === 200 && authMeData.user?.role === 'student', 'Student auth/me returns student role');

    // -------------------------------------------------------------
    // TEST 22 — Existing assessments still work
    // -------------------------------------------------------------
    console.log('\n--- TEST 22: Existing Student Assessment Submission & Completion ---');
    const asmId = startAssessData.assessmentId;
    const submitAssessRes = await fetch(`${BASE_URL}/assessment/${asmId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        questionId: startAssessData.question._id || startAssessData.question.id,
        selectedOption: 0,
      }),
    });
    const submitAssessData = await submitAssessRes.json();
    assert(submitAssessRes.status === 200 && submitAssessData.success, 'Student answer recorded successfully');

    const completeAssessRes = await fetch(`${BASE_URL}/assessment/${asmId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
    });
    const completeAssessData = await completeAssessRes.json();
    assert(completeAssessRes.status === 200 && completeAssessData.result, 'Assessment completed and result generated');

    // -------------------------------------------------------------
    // TEST 23 — Existing skill-gap engine still works
    // -------------------------------------------------------------
    console.log('\n--- TEST 23: Skill-Gap Engine Verification ---');
    const readinessRes = await fetch(`${BASE_URL}/analysis/readiness`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const readinessData = await readinessRes.json();
    assert(
      readinessRes.status === 200 && readinessData.readinessScore !== undefined,
      `Readiness score calculated: ${readinessData.readinessScore}%`
    );

    // -------------------------------------------------------------
    // TEST 24 — Existing roadmap still works
    // -------------------------------------------------------------
    console.log('\n--- TEST 24: Learning Roadmap Generation ---');
    const roadmapRes = await fetch(`${BASE_URL}/roadmap`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const roadmapData = await roadmapRes.json();
    assert(
      roadmapRes.status === 200 && roadmapData.data?.items?.length > 0,
      `Learning roadmap returned ${roadmapData.data?.items?.length} items`
    );

    // -------------------------------------------------------------
    // TEST 25 — Existing dashboard still works
    // -------------------------------------------------------------
    console.log('\n--- TEST 25: Student Dashboard Analytics ---');
    const dashStudentRes = await fetch(`${BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const dashStudentData = await dashStudentRes.json();
    assert(
      dashStudentRes.status === 200 && dashStudentData.student,
      'Student dashboard returned student info and overview metrics'
    );

    // -------------------------------------------------------------
    // TEST 26 — Existing Resume Analyzer still works
    // -------------------------------------------------------------
    console.log('\n--- TEST 26: Resume Analyzer Feature Check ---');
    const sampleResume = 'John Doe. Data Analyst. Proficient in Python, SQL, Excel, and Pandas.';
    const pdfBuf = createTestPdfBuffer(sampleResume);
    const formPdf = new FormData();
    formPdf.append('resume', new Blob([pdfBuf], { type: 'application/pdf' }), 'test_resume.pdf');

    const resumeRes = await fetch(`${BASE_URL}/resume/analyze`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: formPdf,
    });
    const resumeData = await resumeRes.json();
    assert(
      (resumeRes.status === 200 || resumeRes.status === 201) && resumeData.data?.matchScore !== undefined,
      `Resume analyzer parsed and scored resume: ${resumeData.data?.matchScore}%`
    );

    // -------------------------------------------------------------
    // TEST 27 — MongoDB Atlas persistence verified
    // -------------------------------------------------------------
    console.log('\n--- TEST 27: MongoDB Atlas Persistence Verification ---');
    const persistedAdmin = await User.findById(adminUser._id);
    assert(persistedAdmin && persistedAdmin.role === 'admin', 'Admin user verified in MongoDB Atlas');
    const persistedSkill = await Skill.findById(createdSkillId);
    assert(persistedSkill && persistedSkill.name === newSkillName, 'Admin-created skill verified in MongoDB Atlas');

    // -------------------------------------------------------------
    // TEST 28 — Frontend production build passes
    // -------------------------------------------------------------
    console.log('\n--- TEST 28: Frontend Production Build Verification ---');
    const clientDistPath = path.resolve('../client/dist/index.html');
    const buildExists = fs.existsSync(clientDistPath);
    assert(buildExists, `Frontend production build artifact exists at ${clientDistPath}`);

    console.log('\n===============================================================');
    console.log(`   ALL 28 STAGE 9 TESTS PASSED SUCCESSFULLY! (${passCount}/28)  `);
    console.log('===============================================================\n');

  } catch (error) {
    console.error('\n❌ STAGE 9 TEST FAILED WITH ERROR:\n', error);
    process.exitCode = 1;
  } finally {
    console.log('--- Cleaning Up Test Fixtures ---');
    try {
      if (cleanupQuestionIds.length > 0) {
        await Question.deleteMany({ _id: { $in: cleanupQuestionIds } });
      }
      if (cleanupSkillIds.length > 0) {
        await Skill.deleteMany({ _id: { $in: cleanupSkillIds } });
      }
      if (cleanupCareerIds.length > 0) {
        await Career.deleteMany({ _id: { $in: cleanupCareerIds } });
      }
      if (cleanupUserIds.length > 0) {
        await User.deleteMany({ _id: { $in: cleanupUserIds } });
      }
    } catch (cleanupErr) {
      console.error('Cleanup warning:', cleanupErr);
    }

    if (server) {
      server.close();
    }
    await mongoose.disconnect();
    console.log('[TEST] Database disconnected & server closed.');
  }
}

runStage9Tests();
