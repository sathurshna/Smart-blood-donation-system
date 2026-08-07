require('dotenv').config();
const pool = require('./config/db');
const express = require('express'); //loads the Express library so we can use it
const app = express();

 /*
    HTTP Method - action
    They are part of the HTTP protocol, which is how web browsers, mobile apps, and servers communicate.
    GET - Read Information
    POST - Create Something New
    PUT - update
    DELETE - delete existing data

    backend/
├── src/
│   ├── config/          → database connection setup
│   ├── routes/          → auth.routes.js → defines URLs like /api/auth/login
│   ├── controllers/     → auth.controller.js → handles HTTP request/response
│   ├── services/        → auth.service.js → business logic (hashing, token creation)
│   ├── middleware/      → auth.middleware.js → verifies JWT on protected routes
├── server.js
├── package.json

routes just map a URL to a function — no logic, purely "traffic direction"
controllers handle the HTTP details — reading req.body, sending res.json(...)
services contain the actual logic (hash a password, check credentials, generate a token) — written so they don't know or care about HTTP at all, which means you could reuse this logic elsewhere (e.g., a CLI script) without rewriting it





*/

app.use(express.json());
//tells Express to automatically parse incoming JSON request bodies (you'll need this for login, registration, etc.)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});
//defines a route; when someone visits /health, respond with a simple status message. This is a standard pattern used to check "is my server alive?"

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
//starts the server listening for requests

app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ connected: true, time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});