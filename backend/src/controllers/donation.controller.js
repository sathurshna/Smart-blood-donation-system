const {
  acceptRequest,
  completeDonation,
  getDonorHistory,
  getRequestDonations,
} = require('../services/donation.service');

async function accept(req, res) {
  try {
    const requestId = parseInt(req.params.requestId, 10);
    if (isNaN(requestId)) {
      return res.status(400).json({ error: 'Invalid request ID' });
    }
    const donation = await acceptRequest(req.user.userId, requestId);
    res.status(201).json(donation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function complete(req, res) {
  try {
    const donationId = parseInt(req.params.donationId, 10);
    if (isNaN(donationId)) {
      return res.status(400).json({ error: 'Invalid donation ID' });
    }
    const donation = await completeDonation(req.user.userId, donationId);
    res.json(donation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function getHistory(req, res) {
  try {
    const history = await getDonorHistory(req.user.userId);
    res.json(history);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function getForRequest(req, res) {
  try {
    const requestId = parseInt(req.params.requestId, 10);
    if (isNaN(requestId)) {
      return res.status(400).json({ error: 'Invalid request ID' });
    }
    const donations = await getRequestDonations(req.user.userId, requestId);
    res.json(donations);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = { accept, complete, getHistory, getForRequest };
