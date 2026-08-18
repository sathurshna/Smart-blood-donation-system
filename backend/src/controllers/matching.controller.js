const { getMatchesForRequest, getNearbyRequestsForDonor } = require('../services/matching.service');

//Does this blood request actually belong to this hospital?
async function getMatches(req, res) {
  try {
    const requestId = parseInt(req.params.id, 10);
    if (isNaN(requestId)) {
      return res.status(400).json({ error: 'Invalid request ID' });
    }
    ////calling the srvc
    const matches = await getMatchesForRequest(req.user.userId, requestId);
    res.json(matches);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

//donor --- Show me blood requests that I could potentially help with
async function getNearby(req, res) {
  try {
    //calling the srvc
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
