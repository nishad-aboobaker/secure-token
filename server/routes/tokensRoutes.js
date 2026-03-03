const express = require('express');
const router = express.Router();
const { generateToken, verifyToken, getStats, updateSettings, resetStats, getAllTokens } = require('../controllers/tokensController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Public — landing page needs stats
router.get('/stats', getStats);

// Public — but rate-limited in controller
router.post('/generate', generateToken);

// Admin only
router.get('/list', authMiddleware, requireRole('admin'), getAllTokens);
router.post('/verify', authMiddleware, requireRole('admin'), verifyToken);
router.put('/settings', authMiddleware, requireRole('admin'), updateSettings);
router.put('/reset', authMiddleware, requireRole('admin'), resetStats);



module.exports = router;
