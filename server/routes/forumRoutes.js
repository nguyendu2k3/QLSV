const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  addComment,
  uploadFiles,
  uploadFilesToDB,
  uploadMediaFiles,
  uploadMediaFilesToDB,
  incrementPostView,
  uploadCommentImage,
  addCommentWithImageInDB,
  likePost,
  unlikePost,
  getForumStats
} = require('../controllers/forumController');
const { protect } = require('../middleware/auth');

// Lấy thống kê diễn đàn - QUAN TRỌNG: đặt trước các route có pattern động để tránh nhầm lẫn
router.get('/stats', protect, getForumStats);

router.post('/posts', protect, createPost);
router.get('/posts', getPosts);
router.get('/posts/:postId', getPostById);
router.put('/posts/:postId', protect, updatePost);
router.delete('/posts/:postId', protect, deletePost);

// Route cho comment thông thường (lưu file vào filesystem)
router.post('/posts/:postId/comments', protect, uploadCommentImage, addComment);
// Route mới cho comment với ảnh lưu trực tiếp vào DB
router.post('/posts/:postId/comments-with-db-image', protect, addCommentWithImageInDB);

router.post('/posts/:postId/view', incrementPostView);

// Route upload file vào filesystem
router.post('/upload', protect, uploadFiles, uploadMediaFiles);
// Route mới để upload file trực tiếp vào DB
router.post('/upload-to-db', protect, uploadFilesToDB, uploadMediaFilesToDB);

router.post('/posts/:id/like', protect, likePost);
router.post('/posts/:id/unlike', protect, unlikePost);

module.exports = router;