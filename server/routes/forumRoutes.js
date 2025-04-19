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
  uploadMediaFiles,
  incrementPostView,
  uploadCommentImage,
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
router.post('/posts/:postId/comments', protect, uploadCommentImage, addComment);
router.post('/posts/:postId/view', incrementPostView);
router.post('/upload', protect, uploadFiles, uploadMediaFiles);
router.post('/posts/:id/like', protect, likePost);
router.post('/posts/:id/unlike', protect, unlikePost);

module.exports = router;