const pool = require('../config/db');

async function getHospitalProfile(userId) {
  const result = await pool.query(
    'SELECT id, name, address, phone FROM hospitals WHERE user_id = $1',
    [userId]
  );
  if (result.rows.length === 0) {
    throw new Error('Hospital profile not found');
  }
  return result.rows[0];
}

async function createHospitalProfile(userId, { name, address, phone }) {
  const result = await pool.query(
    `INSERT INTO hospitals (user_id, name, address, phone)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, address, phone`,
    [userId, name, address, phone]
  );
  return result.rows[0];
}

async function updateHospitalProfile(userId, updates) {
  const { name, address, phone } = updates;
  const result = await pool.query(
    `UPDATE hospitals
     SET name = COALESCE($1, name),
         address = COALESCE($2, address),
         phone = COALESCE($3, phone)
     WHERE user_id = $4
     RETURNING id, name, address, phone`,
    [name, address, phone, userId]
  );
  if (result.rows.length === 0) {
    throw new Error('Hospital profile not found');
  }
  return result.rows[0];
}

module.exports = { getHospitalProfile, createHospitalProfile, updateHospitalProfile };