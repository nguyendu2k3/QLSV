const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  getUserProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  getUserPosts,
  getUserPostsById
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Cấu hình multer cho upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // giới hạn 5MB
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Chỉ chấp nhận file hình ảnh: jpeg, jpg, png, gif'));
  }
});

// Định nghĩa routes
router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.get('/profile/:userId', protect, getUserProfile); // Route để xem profile người dùng khác
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/change-password', protect, changePassword);
router.get('/posts', protect, getUserPosts);
router.get('/posts/:userId', protect, getUserPostsById); // Route để xem bài viết của người dùng khác

module.exports = router;