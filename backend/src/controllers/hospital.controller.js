const { getHospitalProfile, createHospitalProfile, updateHospitalProfile } = require('../services/hospital.service');

async function getProfile(req, res) {
  try {
    const profile = await getHospitalProfile(req.user.userId);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

async function createProfile(req, res) {
  try {
    const { name, address, phone } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    const profile = await createHospitalProfile(req.user.userId, { name, address, phone });
    res.status(201).json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const profile = await updateHospitalProfile(req.user.userId, req.body);
    res.json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = { getProfile, createProfile, updateProfile };