require('dotenv').config();
const jwt = require('jsonwebtoken');
const pool = require('../src/config/db');
const express = require('express');
const requestRoutes = require('../src/routes/request.routes');

const app = express();
app.use(express.json());
app.use('/api/requests', requestRoutes);

async function runRequestTests() {
  console.log('--- Running Request & Lifecycle API Integration Tests ---');
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/requests`;

  try {
    await pool.query("DELETE FROM users WHERE email LIKE 'reqtest_%'");

    // Create Hospital User & Profile
    const hospUserRes = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ('reqtest_hosp@example.com', 'hash', 'hospital') RETURNING id"
    );
    const hospUserId = hospUserRes.rows[0].id;
    await pool.query(
      "INSERT INTO hospitals (user_id, name, address, phone) VALUES ($1, 'ReqTest City Hospital', '456 Union Place', '0115556666')",
      [hospUserId]
    );
    const hospitalToken = jwt.sign(
      { userId: hospUserId, role: 'hospital' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create Donor User & Token (for RBAC check)
    const donorUserRes = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ('reqtest_donor@example.com', 'hash', 'donor') RETURNING id"
    );
    const donorToken = jwt.sign(
      { userId: donorUserRes.rows[0].id, role: 'donor' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 1. Create Blood Request
    const createReqRes = await fetch(`${baseUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hospitalToken}`,
      },
      body: JSON.stringify({
        blood_group: 'AB-',
        units_needed: 4,
        urgency: 'critical',
        latitude: 6.9271,
        longitude: 79.8612,
      }),
    });
    if (createReqRes.status !== 201) {
      throw new Error(`Create request failed with status ${createReqRes.status}`);
    }
    const createdReq = await createReqRes.json();
    if (createdReq.blood_group !== 'AB-' || createdReq.status !== 'open') {
      throw new Error('Created blood request data mismatch');
    }
    const requestId = createdReq.id;
    console.log('  ✅ POST /api/requests -> 201 Created (Status: open)');

    // 2. Reject Missing Blood Group or Units
    const badReqRes = await fetch(`${baseUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hospitalToken}`,
      },
      body: JSON.stringify({
        urgency: 'low',
      }),
    });
    if (badReqRes.status !== 400) {
      throw new Error(`Expected 400 for missing fields, got ${badReqRes.status}`);
    }
    console.log('  ✅ POST /api/requests (Validation Error) -> 400 Bad Request');

    // 3. Get Hospital's Own Requests
    const getMineRes = await fetch(`${baseUrl}/mine`, {
      headers: { Authorization: `Bearer ${hospitalToken}` },
    });
    if (getMineRes.status !== 200) {
      throw new Error(`Get hospital requests failed with status ${getMineRes.status}`);
    }
    const myRequests = await getMineRes.json();
    if (!Array.isArray(myRequests) || !myRequests.some((r) => r.id === requestId)) {
      throw new Error('Created request not found in GET /api/requests/mine');
    }
    console.log('  ✅ GET /api/requests/mine -> 200 OK');

    // 4. State Machine Transition: open -> matched
    const toMatchedRes = await fetch(`${baseUrl}/${requestId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hospitalToken}`,
      },
      body: JSON.stringify({ status: 'matched' }),
    });
    if (toMatchedRes.status !== 200) {
      throw new Error(`Status transition to matched failed with status ${toMatchedRes.status}`);
    }
    const matchedData = await toMatchedRes.json();
    if (matchedData.status !== 'matched') {
      throw new Error('Request status did not update to matched');
    }
    console.log('  ✅ PUT /api/requests/:id/status (open -> matched) -> 200 OK');

    // 5. State Machine Transition: matched -> completed
    const toCompletedRes = await fetch(`${baseUrl}/${requestId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hospitalToken}`,
      },
      body: JSON.stringify({ status: 'completed' }),
    });
    if (toCompletedRes.status !== 200) {
      throw new Error(`Status transition to completed failed with status ${toCompletedRes.status}`);
    }
    const completedData = await toCompletedRes.json();
    if (completedData.status !== 'completed') {
      throw new Error('Request status did not update to completed');
    }
    console.log('  ✅ PUT /api/requests/:id/status (matched -> completed) -> 200 OK');

    // 6. State Machine: Reject Invalid Transition (completed -> open)
    const invalidTransRes = await fetch(`${baseUrl}/${requestId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hospitalToken}`,
      },
      body: JSON.stringify({ status: 'open' }),
    });
    if (invalidTransRes.status !== 400) {
      throw new Error(`Expected 400 for invalid transition, got ${invalidTransRes.status}`);
    }
    console.log('  ✅ PUT /api/requests/:id/status (Reject Invalid: completed -> open) -> 400 Bad Request');

    // 7. Role RBAC Verification (Donor cannot create request)
    const donorCreateRes = await fetch(`${baseUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`,
      },
      body: JSON.stringify({
        blood_group: 'O+',
        units_needed: 1,
      }),
    });
    if (donorCreateRes.status !== 403) {
      throw new Error(`Expected 403 for donor attempting to create request, got ${donorCreateRes.status}`);
    }
    console.log('  ✅ POST /api/requests (Donor Role Blocked) -> 403 Forbidden');

    // Cleanup
    await pool.query("DELETE FROM users WHERE email LIKE 'reqtest_%'");
    console.log('  ✅ Request & Lifecycle test cleanup completed');
  } finally {
    server.close();
  }
}

if (require.main === module) {
  runRequestTests()
    .then(() => pool.end())
    .catch((err) => {
      console.error('❌ Request test suite failed:', err);
      pool.end();
      process.exit(1);
    });
}

module.exports = runRequestTests;
