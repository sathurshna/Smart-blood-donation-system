const pool = require('../config/db');

async function getDonorProfile(userId) {
  const result = await pool.query(
    'SELECT id, name, phone, blood_group, latitude, longitude, available, last_donation_date FROM donors WHERE user_id = $1',
    [userId]
  );
  if (result.rows.length === 0) {
    throw new Error('Donor profile not found');
  }
  return result.rows[0];
}

async function updateDonorProfile(userId, updates) {
  const { name, phone, blood_group, latitude, longitude, available, last_donation_date } = updates;

  const result = await pool.query(
    `UPDATE donors
     SET name = COALESCE($1, name),
         phone = COALESCE($2, phone),
         blood_group = COALESCE($3, blood_group),
         latitude = COALESCE($4, latitude),
         longitude = COALESCE($5, longitude),
         available = COALESCE($6, available),
         last_donation_date = COALESCE($7, last_donation_date)
     WHERE user_id = $8
     RETURNING id, name, phone, blood_group, latitude, longitude, available, last_donation_date`,
    [name, phone, blood_group, latitude, longitude, available, last_donation_date, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Donor profile not found');
  }
  return result.rows[0];
}

async function createDonorProfile(userId, { name, phone, blood_group, latitude, longitude }) {
  const result = await pool.query(
    `INSERT INTO donors (user_id, name, phone, blood_group, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, phone, blood_group, latitude, longitude, available, last_donation_date`,
    [userId, name, phone, blood_group, latitude, longitude]
  );
  return result.rows[0];
}

module.exports = { getDonorProfile, updateDonorProfile, createDonorProfile };