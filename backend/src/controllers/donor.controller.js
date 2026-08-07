const { getDonorProfile, updateDonorProfile, createDonorProfile } = require('../services/donor.service');

async function getProfile(req, res) {
  try {
    const profile = await getDonorProfile(req.user.userId);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

async function createProfile(req, res) {
  try {
    const { name, phone, blood_group, latitude, longitude } = req.body;
    if (!name || !blood_group) {
      return res.status(400).json({ error: 'name and blood_group are required' });
    }
    const profile = await createDonorProfile(req.user.userId, { name, phone, blood_group, latitude, longitude });
    res.status(201).json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const profile = await updateDonorProfile(req.user.userId, req.body);
    res.json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = { getProfile, createProfile, updateProfile };