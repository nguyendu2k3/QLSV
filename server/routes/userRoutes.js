const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Định nghĩa routes
router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;