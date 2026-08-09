const pool = require('../config/db');

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

async function completeRequest(hospitalUserId, requestId) {
  const result = await pool.query(
    `UPDATE blood_requests br
     SET status = 'completed'
     FROM hospitals h
     WHERE br.hospital_id = h.id
       AND h.user_id = $1
       AND br.id = $2
     RETURNING br.*`,
    [hospitalUserId, requestId]
  );
  if (result.rows.length === 0) {
    throw new Error('Request not found or not owned by this hospital');
  }
  return result.rows[0];
}

module.exports = { createRequest, getHospitalRequests, completeRequest };