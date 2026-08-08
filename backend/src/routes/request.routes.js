const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { create, getMine, updateStatus } = require('../controllers/request.controller');

router.use(verifyToken, requireRole('hospital'));

router.post('/', create);
router.get('/mine', getMine);
router.put('/:id/status', updateStatus);

module.exports = router;