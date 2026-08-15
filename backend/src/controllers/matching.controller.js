const { getMatchesForRequest, getNearbyRequestsForDonor } = require('../services/matching.service');

async function getMatches(req, res) {
  try {
    const requestId = parseInt(req.params.id, 10);
    if (isNaN(requestId)) {
      return res.status(400).json({ error: 'Invalid request ID' });
    }
    const matches = await getMatchesForRequest(req.user.userId, requestId);
    res.json(matches);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function getNearby(req, res) {
  try {
    const nearby = await getNearbyRequestsForDonor(req.user.userId);
    res.json(nearby);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = {
  getMatches,
  getNearby,
};
