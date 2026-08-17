require('dotenv').config();
const jwt = require('jsonwebtoken');
const pool = require('../src/config/db');
const express = require('express');
const donorRoutes = require('../src/routes/donor.routes');

const app = express();
app.use(express.json());
app.use('/api/donors', donorRoutes);

async function runDonorTests() {
  console.log('--- Running Donor Profile API Integration Tests ---');
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/donors`;

  try {
    await pool.query("DELETE FROM users WHERE email LIKE 'donortest_%'");

    // Create Donor User & Token
    const donorUserRes = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ('donortest_user@example.com', 'hash', 'donor') RETURNING id"
    );
    const donorUserId = donorUserRes.rows[0].id;
    const donorToken = jwt.sign(
      { userId: donorUserId, role: 'donor' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create Hospital User & Token (for RBAC test)
    const hospUserRes = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ('donortest_hosp@example.com', 'hash', 'hospital') RETURNING id"
    );
    const hospitalToken = jwt.sign(
      { userId: hospUserRes.rows[0].id, role: 'hospital' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 1. Create Donor Profile
    const createRes = await fetch(`${baseUrl}/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`,
      },
      body: JSON.stringify({
        name: 'Kamal Silva',
        phone: '0711234567',
        blood_group: 'O+',
        latitude: 6.9271,
        longitude: 79.8612,
      }),
    });
    if (createRes.status !== 201) {
      throw new Error(`Create donor profile failed with status ${createRes.status}`);
    }
    const createData = await createRes.json();
    if (createData.name !== 'Kamal Silva' || createData.blood_group !== 'O+') {
      throw new Error('Created donor profile data mismatch');
    }
    console.log('  ✅ POST /api/donors/profile -> 201 Created');

    // 2. Get Donor Profile
    const getRes = await fetch(`${baseUrl}/profile`, {
      headers: { Authorization: `Bearer ${donorToken}` },
    });
    if (getRes.status !== 200) {
      throw new Error(`Get donor profile failed with status ${getRes.status}`);
    }
    const getData = await getRes.json();
    if (getData.name !== 'Kamal Silva' || getData.available !== true) {
      throw new Error('Get profile returned unexpected data');
    }
    console.log('  ✅ GET /api/donors/profile -> 200 OK');

    // 3. Update Donor Profile (toggle availability & location)
    const updateRes = await fetch(`${baseUrl}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`,
      },
      body: JSON.stringify({
        available: false,
        phone: '0719876543',
        last_donation_date: '2026-01-15',
      }),
    });
    if (updateRes.status !== 200) {
      throw new Error(`Update donor profile failed with status ${updateRes.status}`);
    }
    const updateData = await updateRes.json();
    if (updateData.available !== false || updateData.phone !== '0719876543') {
      throw new Error('Updated profile did not reflect new values');
    }
    console.log('  ✅ PUT /api/donors/profile -> 200 OK (Updated availability & phone)');

    // 4. Role RBAC Verification (Hospital user blocked)
    const rbacRes = await fetch(`${baseUrl}/profile`, {
      headers: { Authorization: `Bearer ${hospitalToken}` },
    });
    if (rbacRes.status !== 403) {
      throw new Error(`Expected 403 for hospital token accessing donor profile, got ${rbacRes.status}`);
    }
    console.log('  ✅ GET /api/donors/profile (Hospital Role Blocked) -> 403 Forbidden');

    // 5. Unauthenticated Check
    const unauthRes = await fetch(`${baseUrl}/profile`);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated request, got ${unauthRes.status}`);
    }
    console.log('  ✅ GET /api/donors/profile (Unauthenticated Blocked) -> 401 Unauthorized');

    // Cleanup
    await pool.query("DELETE FROM users WHERE email LIKE 'donortest_%'");
    console.log('  ✅ Donor test cleanup completed');
  } finally {
    server.close();
  }
}

if (require.main === module) {
  runDonorTests()
    .then(() => pool.end())
    .catch((err) => {
      console.error('❌ Donor test suite failed:', err);
      pool.end();
      process.exit(1);
    });
}

module.exports = runDonorTests;
