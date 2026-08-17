require('dotenv').config();
const jwt = require('jsonwebtoken');
const pool = require('../src/config/db');
const express = require('express');
const hospitalRoutes = require('../src/routes/hospital.routes');

const app = express();
app.use(express.json());
app.use('/api/hospitals', hospitalRoutes);

async function runHospitalTests() {
  console.log('--- Running Hospital Profile API Integration Tests ---');
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/hospitals`;

  try {
    await pool.query("DELETE FROM users WHERE email LIKE 'hosptest_%'");

    // Create Hospital User & Token
    const hospUserRes = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ('hosptest_user@example.com', 'hash', 'hospital') RETURNING id"
    );
    const hospUserId = hospUserRes.rows[0].id;
    const hospitalToken = jwt.sign(
      { userId: hospUserId, role: 'hospital' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create Donor User & Token (for RBAC check)
    const donorUserRes = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ('hosptest_donor@example.com', 'hash', 'donor') RETURNING id"
    );
    const donorToken = jwt.sign(
      { userId: donorUserRes.rows[0].id, role: 'donor' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 1. Create Hospital Profile
    const createRes = await fetch(`${baseUrl}/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hospitalToken}`,
      },
      body: JSON.stringify({
        name: 'National Blood Bank Center',
        address: '555 Health Avenue, Colombo',
        phone: '0112111222',
      }),
    });
    if (createRes.status !== 201) {
      throw new Error(`Create hospital profile failed with status ${createRes.status}`);
    }
    const createData = await createRes.json();
    if (createData.name !== 'National Blood Bank Center') {
      throw new Error('Created hospital profile name mismatch');
    }
    console.log('  ✅ POST /api/hospitals/profile -> 201 Created');

    // 2. Get Hospital Profile
    const getRes = await fetch(`${baseUrl}/profile`, {
      headers: { Authorization: `Bearer ${hospitalToken}` },
    });
    if (getRes.status !== 200) {
      throw new Error(`Get hospital profile failed with status ${getRes.status}`);
    }
    const getData = await getRes.json();
    if (getData.name !== 'National Blood Bank Center' || getData.phone !== '0112111222') {
      throw new Error('Get hospital profile returned unexpected data');
    }
    console.log('  ✅ GET /api/hospitals/profile -> 200 OK');

    // 3. Update Hospital Profile
    const updateRes = await fetch(`${baseUrl}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hospitalToken}`,
      },
      body: JSON.stringify({
        phone: '0119998888',
        address: '777 New Medical Square',
      }),
    });
    if (updateRes.status !== 200) {
      throw new Error(`Update hospital profile failed with status ${updateRes.status}`);
    }
    const updateData = await updateRes.json();
    if (updateData.phone !== '0119998888' || updateData.address !== '777 New Medical Square') {
      throw new Error('Updated hospital profile values mismatch');
    }
    console.log('  ✅ PUT /api/hospitals/profile -> 200 OK');

    // 4. Role RBAC Verification (Donor user blocked)
    const rbacRes = await fetch(`${baseUrl}/profile`, {
      headers: { Authorization: `Bearer ${donorToken}` },
    });
    if (rbacRes.status !== 403) {
      throw new Error(`Expected 403 for donor token accessing hospital profile, got ${rbacRes.status}`);
    }
    console.log('  ✅ GET /api/hospitals/profile (Donor Role Blocked) -> 403 Forbidden');

    // 5. Unauthenticated Check
    const unauthRes = await fetch(`${baseUrl}/profile`);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated request, got ${unauthRes.status}`);
    }
    console.log('  ✅ GET /api/hospitals/profile (Unauthenticated Blocked) -> 401 Unauthorized');

    // Cleanup
    await pool.query("DELETE FROM users WHERE email LIKE 'hosptest_%'");
    console.log('  ✅ Hospital test cleanup completed');
  } finally {
    server.close();
  }
}

if (require.main === module) {
  runHospitalTests()
    .then(() => pool.end())
    .catch((err) => {
      console.error('❌ Hospital test suite failed:', err);
      pool.end();
      process.exit(1);
    });
}

module.exports = runHospitalTests;
