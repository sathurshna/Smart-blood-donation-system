const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { accept, complete, getHistory, getForRequest } = require('../controllers/donation.controller');

// Donor routes
router.post('/requests/:requestId/accept', verifyToken, requireRole('donor'), accept);
router.put('/:donationId/complete', verifyToken, requireRole('donor'), complete);
router.get('/mine', verifyToken, requireRole('donor'), getHistory);

// Hospital routes
router.get('/requests/:requestId', verifyToken, requireRole('hospital'), getForRequest);

module.exports = router;
