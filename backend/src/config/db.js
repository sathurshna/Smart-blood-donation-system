const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'sthz7',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'smart_blood_donation',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

module.exports = pool;
