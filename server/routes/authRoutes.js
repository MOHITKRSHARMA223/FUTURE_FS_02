const express = require('express');
const router = express.Router();
const { login, register, getMe, seedAdmin, updatePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/login', login);
router.post('/register', register);
router.post('/seed', seedAdmin);

// Protected routes
router.get('/me', protect, getMe);
router.put('/password', protect, updatePassword);

module.exports = router;
