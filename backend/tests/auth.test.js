require('dotenv').config();
const jwt = require('jsonwebtoken');
const pool = require('../src/config/db');
const express = require('express');
const authRoutes = require('../src/routes/auth.routes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

async function runAuthTests() {
  console.log('--- Running Auth API Integration Tests ---');
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/auth`;

  try {
    // Cleanup prior test records
    await pool.query("DELETE FROM users WHERE email LIKE 'authtest_%'");

    // 1. Register Donor
    const regDonorRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'authtest_donor@example.com',
        password: 'Password123!',
        role: 'donor',
      }),
    });
    if (regDonorRes.status !== 201) {
      throw new Error(`Register donor failed with status ${regDonorRes.status}`);
    }
    const regDonorData = await regDonorRes.json();
    if (!regDonorData.user || regDonorData.user.role !== 'donor') {
      throw new Error('Register donor response missing valid user object');
    }
    console.log('  ✅ POST /api/auth/register (Donor) -> 201 Created');

    // 2. Register Hospital
    const regHospRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'authtest_hosp@example.com',
        password: 'Password123!',
        role: 'hospital',
      }),
    });
    if (regHospRes.status !== 201) {
      throw new Error(`Register hospital failed with status ${regHospRes.status}`);
    }
    console.log('  ✅ POST /api/auth/register (Hospital) -> 201 Created');

    // 3. Reject Duplicate Email
    const dupRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'authtest_donor@example.com',
        password: 'Password123!',
        role: 'donor',
      }),
    });
    if (dupRes.status !== 400) {
      throw new Error(`Expected 400 for duplicate email, got ${dupRes.status}`);
    }
    console.log('  ✅ POST /api/auth/register (Duplicate Email) -> 400 Bad Request');

    // 4. Reject Missing Fields
    const missingRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'authtest_bad@example.com' }),
    });
    if (missingRes.status !== 400) {
      throw new Error(`Expected 400 for missing fields, got ${missingRes.status}`);
    }
    console.log('  ✅ POST /api/auth/register (Missing Fields) -> 400 Bad Request');

    // 5. Successful Login
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'authtest_donor@example.com',
        password: 'Password123!',
      }),
    });
    if (loginRes.status !== 200) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }
    const loginData = await loginRes.json();
    if (!loginData.token || !loginData.user) {
      throw new Error('Login response missing token or user');
    }
    const decoded = jwt.verify(loginData.token, process.env.JWT_SECRET);
    if (decoded.role !== 'donor') {
      throw new Error('JWT token payload has incorrect role');
    }
    console.log('  ✅ POST /api/auth/login (Valid Credentials) -> 200 OK (Valid JWT Issued)');

    // 6. Failed Login (Wrong Password)
    const wrongPassRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'authtest_donor@example.com',
        password: 'WrongPassword!',
      }),
    });
    if (wrongPassRes.status !== 401) {
      throw new Error(`Expected 401 for wrong password, got ${wrongPassRes.status}`);
    }
    console.log('  ✅ POST /api/auth/login (Wrong Password) -> 401 Unauthorized');

    // 7. Failed Login (Non-existent Email)
    const nonExistentRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'authtest_nonexistent@example.com',
        password: 'Password123!',
      }),
    });
    if (nonExistentRes.status !== 401) {
      throw new Error(`Expected 401 for non-existent user, got ${nonExistentRes.status}`);
    }
    console.log('  ✅ POST /api/auth/login (Unknown Email) -> 401 Unauthorized');

    // Cleanup
    await pool.query("DELETE FROM users WHERE email LIKE 'authtest_%'");
    console.log('  ✅ Auth test cleanup completed');
  } finally {
    server.close();
  }
}

if (require.main === module) {
  runAuthTests()
    .then(() => pool.end())
    .catch((err) => {
      console.error('❌ Auth test suite failed:', err);
      pool.end();
      process.exit(1);
    });
}

module.exports = runAuthTests;
