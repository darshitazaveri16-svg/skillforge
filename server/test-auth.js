import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from './src/app.js';
import User from './src/models/User.js';
import bcrypt from 'bcryptjs';

async function runAuthTests() {
  console.log('\n=================== STARTING STAGE 2 AUTHENTICATION SUITE ===================\n');
  
  let mongod;
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('[TEST] Connected to In-Memory MongoDB:', uri);
  } catch (err) {
    console.log('[TEST] Connecting to local MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillforge');
  }

  const server = app.listen(5001, () => {
    console.log('[TEST] Test server listening on port 5001');
  });

  const BASE_URL = 'http://localhost:5001/api/auth';
  let token = '';
  let registeredUserId = '';

  try {
    // 1. Register a new student
    console.log('\n--- Test 1: Register a new student ---');
    const regRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sarah Connor',
        email: 'sarah@skillforge.test',
        password: 'Password123!',
        targetCareer: 'Full Stack Developer',
      }),
    });
    const regData = await regRes.json();
    console.log('Registration Response Status:', regRes.status);
    console.log('Registration Payload:', regData);

    if (regRes.status !== 201 || !regData.token) {
      throw new Error('Registration failed!');
    }
    token = regData.token;
    registeredUserId = regData.user._id || regData.user.id;
    console.log('✅ PASS: Registered new student cleanly.');

    // 2. Confirm the user is created in MongoDB
    console.log('\n--- Test 2: Confirm user in MongoDB ---');
    const userInDb = await User.findById(registeredUserId).select('+password');
    if (!userInDb) {
      throw new Error('User not found in MongoDB!');
    }
    console.log('User found in DB:', { id: userInDb._id, name: userInDb.name, email: userInDb.email, role: userInDb.role });
    console.log('✅ PASS: User verified in MongoDB.');

    // 3. Confirm password is hashed
    console.log('\n--- Test 3: Confirm password is hashed ---');
    console.log('Stored Hashed Password:', userInDb.password);
    if (!userInDb.password || userInDb.password === 'Password123!' || !userInDb.password.startsWith('$2')) {
      throw new Error('Password is not bcrypt hashed!');
    }
    const bcryptCheck = await bcrypt.compare('Password123!', userInDb.password);
    if (!bcryptCheck) {
      throw new Error('Bcrypt hash comparison failed!');
    }
    console.log('✅ PASS: Password is securely bcrypt hashed.');

    // 4. Login with correct credentials
    console.log('\n--- Test 4: Login with correct credentials ---');
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sarah@skillforge.test',
        password: 'Password123!',
      }),
    });
    const loginData = await loginRes.json();
    console.log('Login Status:', loginRes.status);
    if (loginRes.status !== 200 || !loginData.token) {
      throw new Error('Login failed with correct credentials!');
    }
    console.log('✅ PASS: Login successful with correct credentials.');

    // 5. Test login with incorrect password
    console.log('\n--- Test 5: Login with incorrect password ---');
    const badLoginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sarah@skillforge.test',
        password: 'WrongPassword999',
      }),
    });
    const badLoginData = await badLoginRes.json();
    console.log('Bad Login Status (Expected 401):', badLoginRes.status, badLoginData.message);
    if (badLoginRes.status !== 401) {
      throw new Error('Login should have failed for incorrect password!');
    }
    console.log('✅ PASS: Rejected incorrect password as expected.');

    // 6. Test protected /api/auth/me without authentication
    console.log('\n--- Test 6: GET /api/auth/me without token ---');
    const unauthRes = await fetch(`${BASE_URL}/me`);
    const unauthData = await unauthRes.json();
    console.log('Unauth Status (Expected 401):', unauthRes.status, unauthData.message);
    if (unauthRes.status !== 401) {
      throw new Error('Protected route allowed unauthenticated access!');
    }
    console.log('✅ PASS: Protected route rejected request without token.');

    // 7. Test /api/auth/me with valid JWT
    console.log('\n--- Test 7: GET /api/auth/me with valid JWT token ---');
    const authRes = await fetch(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const authData = await authRes.json();
    console.log('Auth Status:', authRes.status, authData);
    if (authRes.status !== 200 || authData.user.email !== 'sarah@skillforge.test') {
      throw new Error('GET /api/auth/me failed with valid JWT token!');
    }
    console.log('✅ PASS: Profile fetched successfully using JWT.');

    console.log('\n=================== ALL BACKEND AUTH TESTS PASSED! ===================\n');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  }
}

runAuthTests();
