require('dotenv').config();
const http = require('http');
const jwt = require('jsonwebtoken');
const pool = require('../src/config/db');
const { getMatchesForRequest, getNearbyRequestsForDonor } = require('../src/services/matching.service');
const { calculateDistanceKm, BLOOD_COMPATIBILITY_RECIPIENT, BLOOD_COMPATIBILITY_DONOR } = require('../src/utils/matching.utils');
const donorRoutes = require('../src/routes/donor.routes');
const authRoutes = require('../src/routes/auth.routes');
const hospitalRoutes = require('../src/routes/hospital.routes');
const requestRoutes = require('../src/routes/request.routes');
const express = require('express');

async function runAllTests() {
  console.log('====================================================');
  console.log('       RUNNING ISSUE #13 DONOR MATCHING TESTS       ');
  console.log('====================================================\n');

  try {
    // -----------------------------------------------------------------
    // 1. Utilities Unit Testing
    // -----------------------------------------------------------------
    console.log('--- 1. Testing Utilities & Matrix Compatibility ---');
    const dist = calculateDistanceKm(6.9271, 79.8612, 6.9319, 79.8478);
    console.log(`- Haversine distance between coordinates: ${dist} km`);
    if (dist < 1.5 || dist > 1.6) throw new Error(`Unexpected distance: ${dist}`);
    console.log('  ✅ Haversine distance calculation verified');

    // -----------------------------------------------------------------
    // 2. Service Layer Integration Testing
    // -----------------------------------------------------------------
    console.log('\n--- 2. Testing Matching Service Layer ---');
    await pool.query("DELETE FROM users WHERE email LIKE 'match_test_%'");

    // Create Hospital User
    const hospUser = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ('match_test_hosp@test.com', 'hash', 'hospital') RETURNING id"
    );
    const hospUserId = hospUser.rows[0].id;
    const hosp = await pool.query(
      "INSERT INTO hospitals (user_id, name, address, phone) VALUES ($1, 'Test General Hospital', '123 Hospital Road, Colombo', '0112345678') RETURNING id",
      [hospUserId]
    );
    const hospitalId = hosp.rows[0].id;

    // Create Blood Requests
    const bPosReq = await pool.query(
      `INSERT INTO blood_requests (hospital_id, blood_group, units_needed, urgency, latitude, longitude, status)
       VALUES ($1, 'B+', 3, 'critical', 6.9271, 79.8612, 'open')
       RETURNING id`,
      [hospitalId]
    );
    const bPosReqId = bPosReq.rows[0].id;

    const aNegReq = await pool.query(
      `INSERT INTO blood_requests (hospital_id, blood_group, units_needed, urgency, latitude, longitude, status)
       VALUES ($1, 'A-', 2, 'high', 6.9271, 79.8612, 'open')
       RETURNING id`,
      [hospitalId]
    );
    const aNegReqId = aNegReq.rows[0].id;

    // Create Donors:
    // Donor 1: O- (universal donor, ~1.57km away, available, last donation 100 days ago) -> MATCHES B+ & A-
    const d1User = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ('match_test_d1@test.com', 'hash', 'donor') RETURNING id"
    );
    const d1 = await pool.query(
      `INSERT INTO donors (user_id, name, phone, blood_group, latitude, longitude, available, last_donation_date)
       VALUES ($1, 'Donor 1 (O- eligible & close)', '0771111111', 'O-', 6.9319, 79.8478, TRUE, CURRENT_DATE - INTERVAL '100 days')
       RETURNING id`,
      [d1User.rows[0].id]
    );

    // Donor 2: B+ (exact match for B+, ~6.69km away, available, no past donations) -> MATCHES B+
    const d2User = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ('match_test_d2@test.com', 'hash', 'donor') RETURNING id"
    );
    const d2 = await pool.query(
      `INSERT INTO donors (user_id, name, phone, blood_group, latitude, longitude, available, last_donation_date)
       VALUES ($1, 'Donor 2 (B+ eligible & medium dist)', '0772222222', 'B+', 6.9800, 79.8900, TRUE, NULL)
       RETURNING id`,
      [d2User.rows[0].id]
    );

    // Donor 3: B+ (UNAVAILABLE) -> EXCLUDED
    const d3User = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ('match_test_d3@test.com', 'hash', 'donor') RETURNING id"
    );
    const d3 = await pool.query(
      `INSERT INTO donors (user_id, name, phone, blood_group, latitude, longitude, available, last_donation_date)
       VALUES ($1, 'Donor 3 (B+ unavailable)', '0773333333', 'B+', 6.9271, 79.8612, FALSE, NULL)
       RETURNING id`,
      [d3User.rows[0].id]
    );

    // Donor 4: B+ (DONATED 10 DAYS AGO) -> EXCLUDED (< 56 days)
    const d4User = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ('match_test_d4@test.com', 'hash', 'donor') RETURNING id"
    );
    const d4 = await pool.query(
      `INSERT INTO donors (user_id, name, phone, blood_group, latitude, longitude, available, last_donation_date)
       VALUES ($1, 'Donor 4 (B+ donated recently)', '0774444444', 'B+', 6.9271, 79.8612, TRUE, CURRENT_DATE - INTERVAL '10 days')
       RETURNING id`,
      [d4User.rows[0].id]
    );

    // Donor 5: AB+ (INCOMPATIBLE FOR B+) -> EXCLUDED from B+ matches
    const d5User = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ('match_test_d5@test.com', 'hash', 'donor') RETURNING id"
    );
    const d5 = await pool.query(
      `INSERT INTO donors (user_id, name, phone, blood_group, latitude, longitude, available, last_donation_date)
       VALUES ($1, 'Donor 5 (AB+ incompatible)', '0775555555', 'AB+', 6.9271, 79.8612, TRUE, NULL)
       RETURNING id`,
      [d5User.rows[0].id]
    );

    // Execute Service: getMatchesForRequest
    const bPosMatches = await getMatchesForRequest(hospUserId, bPosReqId);
    const matchIds = bPosMatches.matches.map((m) => m.id);

    if (!matchIds.includes(d1.rows[0].id) || !matchIds.includes(d2.rows[0].id)) {
      throw new Error('Eligible donors missing from matches');
    }
    if (matchIds.includes(d3.rows[0].id) || matchIds.includes(d4.rows[0].id) || matchIds.includes(d5.rows[0].id)) {
      throw new Error('Ineligible or incompatible donor included in matches');
    }

    // Verify Match Score properties
    bPosMatches.matches.forEach((donorMatch) => {
      if (typeof donorMatch.match_score !== 'number' || !donorMatch.score_breakdown) {
        throw new Error('Missing match_score or score_breakdown on matched donor');
      }
    });
    console.log('  ✅ getMatchesForRequest calculated match_score and filtered matches');

    // Execute Service: getNearbyRequestsForDonor
    const d1Nearby = await getNearbyRequestsForDonor(d1User.rows[0].id);
    const nearbyReqIds = d1Nearby.requests.map((r) => r.id);
    if (!nearbyReqIds.includes(bPosReqId) || !nearbyReqIds.includes(aNegReqId)) {
      throw new Error('Universal donor O- missing matching open requests');
    }
    d1Nearby.requests.forEach((reqMatch) => {
      if (typeof reqMatch.match_score !== 'number' || !reqMatch.score_breakdown) {
        throw new Error('Missing match_score or score_breakdown on matched request');
      }
    });
    console.log('  ✅ getNearbyRequestsForDonor calculated match_score and sorted requests');

    // -----------------------------------------------------------------
    // 3. HTTP API Endpoints & RBAC Testing
    // -----------------------------------------------------------------
    console.log('\n--- 3. Testing HTTP Routes & RBAC Middleware ---');
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/donors', donorRoutes);
    app.use('/api/hospitals', hospitalRoutes);
    app.use('/api/requests', requestRoutes);

    const server = app.listen(0);
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;

    const hospitalToken = jwt.sign({ userId: hospUserId, role: 'hospital' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const donorToken = jwt.sign({ userId: d1User.rows[0].id, role: 'donor' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Hospital matches endpoint
    const matchesRes = await fetch(`${baseUrl}/api/requests/${bPosReqId}/matches`, {
      headers: { Authorization: `Bearer ${hospitalToken}` }
    });
    if (matchesRes.status !== 200) throw new Error(`GET /api/requests/:id/matches failed with status ${matchesRes.status}`);
    console.log('  ✅ GET /api/requests/:id/matches (Hospital) -> 200 OK');

    // Donor blocked from hospital endpoint
    const matchesAsDonor = await fetch(`${baseUrl}/api/requests/${bPosReqId}/matches`, {
      headers: { Authorization: `Bearer ${donorToken}` }
    });
    if (matchesAsDonor.status !== 403) throw new Error(`Expected 403 Forbidden, got ${matchesAsDonor.status}`);
    console.log('  ✅ GET /api/requests/:id/matches (Donor) -> 403 Forbidden');

    // Donor nearby endpoint
    const nearbyRes = await fetch(`${baseUrl}/api/requests/nearby`, {
      headers: { Authorization: `Bearer ${donorToken}` }
    });
    if (nearbyRes.status !== 200) throw new Error(`GET /api/requests/nearby failed with status ${nearbyRes.status}`);
    console.log('  ✅ GET /api/requests/nearby (Donor) -> 200 OK');

    // Hospital blocked from donor endpoint
    const nearbyAsHosp = await fetch(`${baseUrl}/api/requests/nearby`, {
      headers: { Authorization: `Bearer ${hospitalToken}` }
    });
    if (nearbyAsHosp.status !== 403) throw new Error(`Expected 403 Forbidden, got ${nearbyAsHosp.status}`);
    console.log('  ✅ GET /api/requests/nearby (Hospital) -> 403 Forbidden');

    server.close();
    await pool.query("DELETE FROM users WHERE email LIKE 'match_test_%'");
    console.log('\n====================================================');
    console.log('       ALL ISSUE #13 TESTS PASSED SUCCESSFULLY      ');
    console.log('====================================================\n');

  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runAllTests();
