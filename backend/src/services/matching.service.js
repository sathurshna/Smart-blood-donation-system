const pool = require('../config/db');
const {
  BLOOD_COMPATIBILITY_RECIPIENT,
  BLOOD_COMPATIBILITY_DONOR,
  MIN_DONATION_INTERVAL_DAYS,
  calculateDistanceKm,
  calculateMatchScore,
} = require('../utils/matching.utils');

async function getMatchesForRequest(hospitalUserId, requestId) {
  // 1. Validate hospital ownership and fetch request details
  const reqResult = await pool.query(
    `SELECT br.*, h.name AS hospital_name, h.address AS hospital_address
     FROM blood_requests br
     JOIN hospitals h ON br.hospital_id = h.id
     WHERE br.id = $1 AND h.user_id = $2`,
    [requestId, hospitalUserId]
    //parameterized query - it protects against SQL injection.
  );

  if (reqResult.rows.length === 0) {
    throw new Error('Request not found or not owned by this hospital');
  }

  const bloodRequest = reqResult.rows[0];
  const compatibleBloodGroups =
    BLOOD_COMPATIBILITY_RECIPIENT[bloodRequest.blood_group] || [bloodRequest.blood_group];

  // 2. Query available and interval-eligible donors with compatible blood groups
  const donorsResult = await pool.query(
    `SELECT id, name, phone, blood_group, latitude, longitude, available, last_donation_date
     FROM donors
     WHERE blood_group = ANY($1::text[])
       AND available = TRUE
       AND (last_donation_date IS NULL OR last_donation_date <= CURRENT_DATE - ($2 || ' days')::INTERVAL)`,
    [compatibleBloodGroups, MIN_DONATION_INTERVAL_DAYS]
  );

  // 3. Compute distance and Match Score for each donor
  // Match Score = compatibility + eligibility + availability + proximity + urgency
  const donors = donorsResult.rows.map((donor) => {
    const distanceKm = calculateDistanceKm(
      bloodRequest.latitude,
      bloodRequest.longitude,
      donor.latitude,
      donor.longitude
    );

    const { score, breakdown } = calculateMatchScore({
      donorBloodGroup: donor.blood_group,
      recipientBloodGroup: bloodRequest.blood_group,
      available: donor.available,
      lastDonationDate: donor.last_donation_date,
      distanceKm,
      urgency: bloodRequest.urgency,
    });

    return {
      ...donor,
      distance_km: distanceKm,
      match_score: score,
      score_breakdown: breakdown,
    };
  });

  // 4. Sort: highest match score first; tiebreaker: closest distance
  donors.sort((a, b) => {
    if (b.match_score !== a.match_score) {
      return b.match_score - a.match_score;
    }
    if (a.distance_km === null && b.distance_km === null) return 0;
    if (a.distance_km === null) return 1;
    if (b.distance_km === null) return -1;
    return a.distance_km - b.distance_km;
  });

  return {
    request: {
      id: bloodRequest.id,
      blood_group: bloodRequest.blood_group,
      units_needed: bloodRequest.units_needed,
      urgency: bloodRequest.urgency,
      status: bloodRequest.status,
      latitude: bloodRequest.latitude,
      longitude: bloodRequest.longitude,
      created_at: bloodRequest.created_at,
    },
    matches_count: donors.length,
    matches: donors,
  };
}

async function getNearbyRequestsForDonor(donorUserId) {
  // 1. Fetch donor profile
  const donorResult = await pool.query(
    `SELECT id, name, blood_group, latitude, longitude, available, last_donation_date
     FROM donors
     WHERE user_id = $1`,
    [donorUserId]
  );

  if (donorResult.rows.length === 0) {
    throw new Error('Donor profile not found — create your donor profile first');
  }

  const donor = donorResult.rows[0];
  const compatibleRecipientGroups =
    BLOOD_COMPATIBILITY_DONOR[donor.blood_group] || [donor.blood_group];

  // 2. Query open requests matching compatible recipient groups
  const requestsResult = await pool.query(
    `SELECT br.id, br.blood_group, br.units_needed, br.urgency, br.status,
            br.latitude, br.longitude, br.created_at,
            h.id AS hospital_id, h.name AS hospital_name, h.address AS hospital_address, h.phone AS hospital_phone
     FROM blood_requests br
     JOIN hospitals h ON br.hospital_id = h.id
     WHERE br.status = 'open'
       AND br.blood_group = ANY($1::text[])`,
    [compatibleRecipientGroups]
  );

  const urgencyPriority = { critical: 1, high: 2, medium: 3, low: 4 };

  // 3. Compute distance and Match Score for each request
  // Match Score = compatibility + eligibility + availability + proximity + urgency
  const requests = requestsResult.rows.map((req) => {
    const distanceKm = calculateDistanceKm(
      donor.latitude,
      donor.longitude,
      req.latitude,
      req.longitude
    );

    const { score, breakdown } = calculateMatchScore({
      donorBloodGroup: donor.blood_group,
      recipientBloodGroup: req.blood_group,
      available: donor.available,
      lastDonationDate: donor.last_donation_date,
      distanceKm,
      urgency: req.urgency,
    });

    return {
      ...req,
      distance_km: distanceKm,
      match_score: score,
      score_breakdown: breakdown,
    };
  });

  // 4. Sort: highest match score first; tiebreaker: urgency priority, then distance
  requests.sort((a, b) => {
    if (b.match_score !== a.match_score) {
      return b.match_score - a.match_score;
    }
    const urgencyA = urgencyPriority[a.urgency] || 5;
    const urgencyB = urgencyPriority[b.urgency] || 5;
    if (urgencyA !== urgencyB) {
      return urgencyA - urgencyB;
    }
    if (a.distance_km === null && b.distance_km === null) return 0;
    if (a.distance_km === null) return 1;
    if (b.distance_km === null) return -1;
    return a.distance_km - b.distance_km;
  });

  return {
    donor: {
      id: donor.id,
      name: donor.name,
      blood_group: donor.blood_group,
      available: donor.available,
      last_donation_date: donor.last_donation_date,
      latitude: donor.latitude,
      longitude: donor.longitude,
    },
    count: requests.length,
    requests,
  };
}

module.exports = {
  getMatchesForRequest,
  getNearbyRequestsForDonor,
};
