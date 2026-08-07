const { registerUser, loginUser } = require('../services/auth.service');

async function register(req, res) {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'email, password, and role are required' });
    }

    const user = await registerUser({ email, password, role });
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const result = await loginUser({ email, password });
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

module.exports = { register, login };