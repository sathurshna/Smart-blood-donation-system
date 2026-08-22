const pool = require('../config/db');

/**
 * Donor accepts an open blood request.
 * - Validates request is 'open'
 * - Guards against a donor accepting the same request twice
 * - Inserts a row into donations
 * - Transitions request status: open → matched
 */
async function acceptRequest(donorUserId, requestId) {
  // Fetch donor profile
  const donorResult = await pool.query(
    'SELECT id FROM donors WHERE user_id = $1',
    [donorUserId]
  );
  if (donorResult.rows.length === 0) {
    throw new Error('Donor profile not found — create your donor profile first');
  }
  const donorId = donorResult.rows[0].id;

  // Fetch and validate the request
  const reqResult = await pool.query(
    'SELECT id, status FROM blood_requests WHERE id = $1',
    [requestId]
  );
  if (reqResult.rows.length === 0) {
    throw new Error('Blood request not found');
  }
  const request = reqResult.rows[0];
  // Guard: prevent duplicate accept by the same donor for the same request
  // (checked before status so returning donors get a meaningful message)
  const dupCheck = await pool.query(
    'SELECT id FROM donations WHERE request_id = $1 AND donor_id = $2',
    [requestId, donorId]
  );
  if (dupCheck.rows.length > 0) {
    throw new Error('You have already accepted this request');
  }

  if (request.status !== 'open') {
    throw new Error(`Cannot accept a request with status '${request.status}' — only 'open' requests can be accepted`);
  }

  // Insert donation record
  const donation = await pool.query(
    `INSERT INTO donations (request_id, donor_id)
     VALUES ($1, $2)
     RETURNING *`,
    [requestId, donorId]
  );

  // Transition request: open → matched
  await pool.query(
    `UPDATE blood_requests SET status = 'matched' WHERE id = $1`,
    [requestId]
  );

  return donation.rows[0];
}

/**
 * Donor marks one of their accepted donations as completed.
 * - Validates the donor owns the donation
 * - Guards against completing an already-completed donation
 * - Sets completed = TRUE on the donation row
 * - Updates donor: last_donation_date = TODAY, available = FALSE
 * - Transitions request: matched → completed
 */
async function completeDonation(donorUserId, donationId) {
  // Fetch donor id
  const donorResult = await pool.query(
    'SELECT id FROM donors WHERE user_id = $1',
    [donorUserId]
  );
  if (donorResult.rows.length === 0) {
    throw new Error('Donor profile not found');
  }
  const donorId = donorResult.rows[0].id;

  // Fetch the donation and verify ownership
  const donationResult = await pool.query(
    'SELECT id, donor_id, request_id, completed FROM donations WHERE id = $1',
    [donationId]
  );
  if (donationResult.rows.length === 0) {
    throw new Error('Donation record not found');
  }
  const donation = donationResult.rows[0];

  if (donation.donor_id !== donorId) {
    throw new Error('You are not authorized to complete this donation');
  }
  if (donation.completed) {
    throw new Error('This donation has already been marked as completed');
  }

  // Mark donation as completed
  const updated = await pool.query(
    `UPDATE donations
     SET completed = TRUE
     WHERE id = $1
     RETURNING *`,
    [donationId]
  );

  // Update donor: record last_donation_date and mark unavailable
  await pool.query(
    `UPDATE donors
     SET last_donation_date = CURRENT_DATE,
         available = FALSE
     WHERE id = $1`,
    [donorId]
  );

  // Transition request: matched → completed
  await pool.query(
    `UPDATE blood_requests SET status = 'completed' WHERE id = $1`,
    [donation.request_id]
  );

  return updated.rows[0];
}

/**
 * Returns full donation history for the authenticated donor,
 * enriched with request and hospital details.
 */
async function getDonorHistory(donorUserId) {
  const donorResult = await pool.query(
    'SELECT id, name, blood_group FROM donors WHERE user_id = $1',
    [donorUserId]
  );
  if (donorResult.rows.length === 0) {
    throw new Error('Donor profile not found');
  }
  const donor = donorResult.rows[0];

  const result = await pool.query(
    `SELECT
       d.id            AS donation_id,
       d.accepted_at,
       d.completed,
       br.id           AS request_id,
       br.blood_group,
       br.units_needed,
       br.urgency,
       br.status       AS request_status,
       h.name          AS hospital_name,
       h.address       AS hospital_address,
       h.phone         AS hospital_phone
     FROM donations d
     JOIN blood_requests br ON d.request_id = br.id
     JOIN hospitals h       ON br.hospital_id = h.id
     WHERE d.donor_id = $1
     ORDER BY d.accepted_at DESC`,
    [donor.id]
  );

  return {
    donor: {
      id: donor.id,
      name: donor.name,
      blood_group: donor.blood_group,
    },
    count: result.rows.length,
    donations: result.rows,
  };
}

/**
 * Returns all donations made against a specific blood request.
 * Only the hospital that owns the request can call this.
 */
async function getRequestDonations(hospitalUserId, requestId) {
  // Verify hospital owns the request
  const reqCheck = await pool.query(
    `SELECT br.id FROM blood_requests br
     JOIN hospitals h ON br.hospital_id = h.id
     WHERE br.id = $1 AND h.user_id = $2`,
    [requestId, hospitalUserId]
  );
  if (reqCheck.rows.length === 0) {
    throw new Error('Request not found or not owned by this hospital');
  }

  const result = await pool.query(
    `SELECT
       d.id            AS donation_id,
       d.accepted_at,
       d.completed,
       dn.id           AS donor_id,
       dn.name         AS donor_name,
       dn.phone        AS donor_phone,
       dn.blood_group  AS donor_blood_group
     FROM donations d
     JOIN donors dn ON d.donor_id = dn.id
     WHERE d.request_id = $1
     ORDER BY d.accepted_at ASC`,
    [requestId]
  );

  return {
    request_id: parseInt(requestId, 10),
    count: result.rows.length,
    donations: result.rows,
  };
}

module.exports = {
  acceptRequest,
  completeDonation,
  getDonorHistory,
  getRequestDonations,
};
