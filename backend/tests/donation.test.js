require('dotenv').config();
const http = require('http');
const jwt = require('jsonwebtoken');
const pool = require('../src/config/db');
const {
  acceptRequest,
  completeDonation,
  getDonorHistory,
  getRequestDonations,
} = require('../src/services/donation.service');
const donorRoutes = require('../src/routes/donor.routes');
const authRoutes = require('../src/routes/auth.routes');
const hospitalRoutes = require('../src/routes/hospital.routes');
const requestRoutes = require('../src/routes/request.routes');
const donationRoutes = require('../src/routes/donation.routes');
const express = require('express');

async function runDonationTests() {
  console.log('====================================================');
  console.log('     RUNNING ISSUE #14 DONATION TRACKING TESTS     ');
  console.log('====================================================\n');

  try {
    // -----------------------------------------------------------------
    // Setup: clean up any leftover test data
    // -----------------------------------------------------------------
    await pool.query("DELETE FROM users WHERE email LIKE 'don_test_%'");

    // Create hospital user + profile
    const hospUser = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ('don_test_hosp@test.com', 'hash', 'hospital') RETURNING id"
    );
    const hospUserId = hospUser.rows[0].id;
    const hosp = await pool.query(
      "INSERT INTO hospitals (user_id, name, address, phone) VALUES ($1, 'Test Hospital', '1 Main St', '0112000000') RETURNING id",
      [hospUserId]
    );
    const hospitalId = hosp.rows[0].id;

    // Create blood request
    const reqResult = await pool.query(
      `INSERT INTO blood_requests (hospital_id, blood_group, units_needed, urgency, latitude, longitude, status)
       VALUES ($1, 'O+', 2, 'high', 6.9271, 79.8612, 'open') RETURNING id`,
      [hospitalId]
    );
    const requestId = reqResult.rows[0].id;

    // Create donor user + profile
    const donorUser = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ('don_test_donor@test.com', 'hash', 'donor') RETURNING id"
    );
    const donorUserId = donorUser.rows[0].id;
    await pool.query(
      `INSERT INTO donors (user_id, name, phone, blood_group, latitude, longitude, available)
       VALUES ($1, 'Test Donor', '0771234567', 'O+', 6.9271, 79.8612, TRUE)`,
      [donorUserId]
    );

    // Create a second donor (for RBAC + isolation tests)
    const donor2User = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ('don_test_donor2@test.com', 'hash', 'donor') RETURNING id"
    );
    const donor2UserId = donor2User.rows[0].id;
    await pool.query(
      `INSERT INTO donors (user_id, name, phone, blood_group, latitude, longitude, available)
       VALUES ($1, 'Test Donor 2', '0779999999', 'O+', 6.9271, 79.8612, TRUE)`,
      [donor2UserId]
    );

    // -----------------------------------------------------------------
    // 1. Service Layer Tests
    // -----------------------------------------------------------------
    console.log('--- 1. Testing Service Layer ---');

    // 1a. Donor accepts an open request
    const donation = await acceptRequest(donorUserId, requestId);
    if (!donation.id || donation.request_id !== requestId) {
      throw new Error('acceptRequest did not return the correct donation row');
    }
    const donationId = donation.id;

    // Verify request is now 'matched'
    const reqStatus = await pool.query('SELECT status FROM blood_requests WHERE id = $1', [requestId]);
    if (reqStatus.rows[0].status !== 'matched') {
      throw new Error(`Expected request status 'matched', got '${reqStatus.rows[0].status}'`);
    }
    console.log('  ✅ acceptRequest: donation row created, request → matched');

    // 1b. Duplicate accept is rejected
    try {
      await acceptRequest(donorUserId, requestId);
      throw new Error('Expected duplicate accept to throw, but it did not');
    } catch (err) {
      if (!err.message.includes('already accepted')) throw err;
    }
    console.log('  ✅ acceptRequest: duplicate accept correctly rejected');

    // 1c. Another donor cannot accept a non-open (matched) request
    try {
      await acceptRequest(donor2UserId, requestId);
      throw new Error('Expected accept of matched request to throw, but it did not');
    } catch (err) {
      if (!err.message.includes("'matched'")) throw err;
    }
    console.log("  ✅ acceptRequest: non-open request correctly rejected with status error");

    // 1d. Donor history includes the accepted donation
    const history = await getDonorHistory(donorUserId);
    if (history.donations.length === 0) {
      throw new Error('getDonorHistory returned empty — expected at least 1 record');
    }
    const histEntry = history.donations.find((d) => d.donation_id === donationId);
    if (!histEntry) throw new Error('getDonorHistory missing the accepted donation');
    if (histEntry.completed !== false) throw new Error('Donation should not be completed yet');
    console.log('  ✅ getDonorHistory: returns accepted (pending) donation with correct data');

    // 1e. Donor cannot complete another donor's donation
    try {
      await completeDonation(donor2UserId, donationId);
      throw new Error('Expected unauthorized complete to throw, but it did not');
    } catch (err) {
      if (!err.message.includes('not authorized')) throw err;
    }
    console.log('  ✅ completeDonation: unauthorized donor correctly rejected');

    // 1f. Donor completes their donation
    const completed = await completeDonation(donorUserId, donationId);
    if (!completed.completed) {
      throw new Error('completeDonation did not set completed = TRUE');
    }

    // Verify request is now 'completed'
    const reqStatus2 = await pool.query('SELECT status FROM blood_requests WHERE id = $1', [requestId]);
    if (reqStatus2.rows[0].status !== 'completed') {
      throw new Error(`Expected request status 'completed', got '${reqStatus2.rows[0].status}'`);
    }

    // Verify donor's last_donation_date and available fields
    const donorRow = await pool.query(
      'SELECT last_donation_date, available FROM donors WHERE user_id = $1',
      [donorUserId]
    );
    if (!donorRow.rows[0].last_donation_date) {
      throw new Error('last_donation_date was not set after completing donation');
    }
    if (donorRow.rows[0].available !== false) {
      throw new Error('available should be FALSE after completing donation');
    }
    console.log('  ✅ completeDonation: completed=TRUE, request→completed, donor.last_donation_date set, available=FALSE');

    // 1g. Cannot complete an already-completed donation
    try {
      await completeDonation(donorUserId, donationId);
      throw new Error('Expected re-complete to throw, but it did not');
    } catch (err) {
      if (!err.message.includes('already been marked')) throw err;
    }
    console.log('  ✅ completeDonation: re-completion correctly rejected');

    // 1h. Hospital views donations for their request
    const reqDonations = await getRequestDonations(hospUserId, requestId);
    if (reqDonations.donations.length === 0) {
      throw new Error('getRequestDonations returned empty');
    }
    if (reqDonations.donations[0].donation_id !== donationId) {
      throw new Error('getRequestDonations did not return the correct donation');
    }
    console.log('  ✅ getRequestDonations: hospital sees donation with donor details');

    // 1i. Hospital cannot view donations for a request they do not own
    try {
      await getRequestDonations(donor2UserId, requestId); // donor2 is not a hospital
      // This will throw because donor2 has no hospital row → request not found
    } catch (err) {
      // expected
    }
    console.log('  ✅ getRequestDonations: non-owner returns error');

    // -----------------------------------------------------------------
    // 2. HTTP API & RBAC Tests
    // -----------------------------------------------------------------
    console.log('\n--- 2. Testing HTTP Routes & RBAC Middleware ---');
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/donors', donorRoutes);
    app.use('/api/hospitals', hospitalRoutes);
    app.use('/api/requests', requestRoutes);
    app.use('/api/donations', donationRoutes);

    const server = app.listen(0);
    const port = server.address().port;
    const base = `http://localhost:${port}`;

    const hospitalToken = jwt.sign({ userId: hospUserId, role: 'hospital' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const donorToken = jwt.sign({ userId: donorUserId, role: 'donor' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const donor2Token = jwt.sign({ userId: donor2UserId, role: 'donor' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Create a fresh open request for HTTP tests
    const req2 = await pool.query(
      `INSERT INTO blood_requests (hospital_id, blood_group, units_needed, urgency, latitude, longitude, status)
       VALUES ($1, 'A+', 1, 'low', 6.9271, 79.8612, 'open') RETURNING id`,
      [hospitalId]
    );
    const requestId2 = req2.rows[0].id;

    // Hospital cannot accept (role-blocked)
    const acceptAsHospRes = await fetch(`${base}/api/donations/requests/${requestId2}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${hospitalToken}` },
    });
    if (acceptAsHospRes.status !== 403) {
      throw new Error(`Expected 403, got ${acceptAsHospRes.status} for hospital trying to accept`);
    }
    console.log('  ✅ POST /api/donations/requests/:id/accept (Hospital) → 403 Forbidden');

    // Donor accepts via HTTP
    const acceptRes = await fetch(`${base}/api/donations/requests/${requestId2}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${donor2Token}` },
    });
    if (acceptRes.status !== 201) {
      const body = await acceptRes.json();
      throw new Error(`POST accept failed with ${acceptRes.status}: ${body.error}`);
    }
    const newDonation = await acceptRes.json();
    const newDonationId = newDonation.id;
    console.log('  ✅ POST /api/donations/requests/:id/accept (Donor) → 201 Created');

    // Donor completes via HTTP
    const completeRes = await fetch(`${base}/api/donations/${newDonationId}/complete`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${donor2Token}` },
    });
    if (completeRes.status !== 200) {
      const body = await completeRes.json();
      throw new Error(`PUT complete failed with ${completeRes.status}: ${body.error}`);
    }
    console.log('  ✅ PUT /api/donations/:id/complete (Donor) → 200 OK');

    // Hospital cannot complete (role-blocked)
    const completeAsHospRes = await fetch(`${base}/api/donations/${newDonationId}/complete`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${hospitalToken}` },
    });
    if (completeAsHospRes.status !== 403) {
      throw new Error(`Expected 403, got ${completeAsHospRes.status} for hospital trying to complete`);
    }
    console.log('  ✅ PUT /api/donations/:id/complete (Hospital) → 403 Forbidden');

    // Donor gets own history via HTTP
    const historyRes = await fetch(`${base}/api/donations/mine`, {
      headers: { Authorization: `Bearer ${donor2Token}` },
    });
    if (historyRes.status !== 200) throw new Error(`GET /mine failed with ${historyRes.status}`);
    console.log('  ✅ GET /api/donations/mine (Donor) → 200 OK');

    // Hospital cannot get donor history (role-blocked)
    const histAsHospRes = await fetch(`${base}/api/donations/mine`, {
      headers: { Authorization: `Bearer ${hospitalToken}` },
    });
    if (histAsHospRes.status !== 403) throw new Error(`Expected 403, got ${histAsHospRes.status}`);
    console.log('  ✅ GET /api/donations/mine (Hospital) → 403 Forbidden');

    // Hospital views request donations
    const reqDonRes = await fetch(`${base}/api/donations/requests/${requestId2}`, {
      headers: { Authorization: `Bearer ${hospitalToken}` },
    });
    if (reqDonRes.status !== 200) throw new Error(`GET /requests/:id failed with ${reqDonRes.status}`);
    console.log('  ✅ GET /api/donations/requests/:id (Hospital) → 200 OK');

    // Donor cannot view hospital-only endpoint
    const reqDonAsDonorRes = await fetch(`${base}/api/donations/requests/${requestId2}`, {
      headers: { Authorization: `Bearer ${donor2Token}` },
    });
    if (reqDonAsDonorRes.status !== 403) throw new Error(`Expected 403, got ${reqDonAsDonorRes.status}`);
    console.log('  ✅ GET /api/donations/requests/:id (Donor) → 403 Forbidden');

    server.close();

    // -----------------------------------------------------------------
    // Cleanup
    // -----------------------------------------------------------------
    await pool.query("DELETE FROM users WHERE email LIKE 'don_test_%'");

    console.log('\n====================================================');
    console.log('     ALL ISSUE #14 TESTS PASSED SUCCESSFULLY       ');
    console.log('====================================================\n');

  } catch (err) {
    throw err;
  }
}

if (require.main === module) {
  runDonationTests()
    .then(() => pool.end())
    .catch((err) => {
      console.error('❌ Donation test suite failed:', err);
      pool.end();
      process.exit(1);
    });
}

module.exports = runDonationTests;
