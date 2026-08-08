const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { getProfile, createProfile, updateProfile } = require('../controllers/donor.controller');

router.use(verifyToken, requireRole('donor'));

router.get('/profile', getProfile);
router.post('/profile', createProfile);
router.put('/profile', updateProfile);

module.exports = router;