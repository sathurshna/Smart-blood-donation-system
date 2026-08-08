const pool = require('../config/db');

const VALID_TRANSITIONS = {
  open: ['matched', 'cancelled'],
  matched: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

async function createRequest(hospitalUserId, { blood_group, units_needed, urgency, latitude, longitude }) {
  const hospitalResult = await pool.query('SELECT id FROM hospitals WHERE user_id = $1', [hospitalUserId]);
  if (hospitalResult.rows.length === 0) {
    throw new Error('Hospital profile not found — create your hospital profile first');
  }
  const hospitalId = hospitalResult.rows[0].id;
  const result = await pool.query(
    `INSERT INTO blood_requests (hospital_id, blood_group, units_needed, urgency, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [hospitalId, blood_group, units_needed, urgency, latitude, longitude]
  );
  return result.rows[0];
}

async function getHospitalRequests(hospitalUserId) {
  const result = await pool.query(
    `SELECT br.* FROM blood_requests br
     JOIN hospitals h ON br.hospital_id = h.id
     WHERE h.user_id = $1
     ORDER BY br.created_at DESC`,
    [hospitalUserId]
  );
  return result.rows;
}

async function transitionRequestStatus(hospitalUserId, requestId, newStatus) {
  const current = await pool.query(
    `SELECT br.status FROM blood_requests br
     JOIN hospitals h ON br.hospital_id = h.id
     WHERE br.id = $1 AND h.user_id = $2`,
    [requestId, hospitalUserId]
  );

  if (current.rows.length === 0) {
    throw new Error('Request not found or not owned by this hospital');
  }

  const currentStatus = current.rows[0].status;
  const allowedNext = VALID_TRANSITIONS[currentStatus] || [];

  if (!allowedNext.includes(newStatus)) {
    throw new Error(`Cannot transition from '${currentStatus}' to '${newStatus}'`);
  }

  const result = await pool.query(
    `UPDATE blood_requests SET status = $1 WHERE id = $2 RETURNING *`,
    [newStatus, requestId]
  );
  return result.rows[0];
}

module.exports = { createRequest, getHospitalRequests, transitionRequestStatus };