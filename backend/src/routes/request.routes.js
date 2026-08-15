const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { create, getMine, updateStatus } = require('../controllers/request.controller');
const { getMatches, getNearby } = require('../controllers/matching.controller');

// Donor routes
router.get('/nearby', verifyToken, requireRole('donor'), getNearby);

// Hospital routes
router.post('/', verifyToken, requireRole('hospital'), create);
router.get('/mine', verifyToken, requireRole('hospital'), getMine);
router.get('/:id/matches', verifyToken, requireRole('hospital'), getMatches);
router.put('/:id/status', verifyToken, requireRole('hospital'), updateStatus);

module.exports = router;