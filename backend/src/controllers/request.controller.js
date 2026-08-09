const { createRequest, getHospitalRequests, transitionRequestStatus } = require('../services/request.service');

async function create(req, res) {
  try {
    const { blood_group, units_needed, urgency, latitude, longitude } = req.body;
    if (!blood_group || !units_needed) {
      return res.status(400).json({ error: 'blood_group and units_needed are required' });
    }
    const request = await createRequest(req.user.userId, { blood_group, units_needed, urgency, latitude, longitude });
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function getMine(req, res) {
  try {
    const requests = await getHospitalRequests(req.user.userId);
    res.json(requests);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }
    const request = await transitionRequestStatus(req.user.userId, req.params.id, status);
    res.json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = { create, getMine, updateStatus };
