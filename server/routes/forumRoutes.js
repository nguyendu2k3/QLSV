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
  unlikePost
} = require('../controllers/forumController');
const { protect } = require('../middleware/auth');

router.post('/posts', protect, createPost);
router.get('/posts', protect, getPosts);
router.get('/posts/:postId', protect, getPostById);
router.put('/posts/:postId', protect, updatePost);
router.delete('/posts/:postId', protect, deletePost);
router.post('/posts/:postId/comments', protect, uploadCommentImage, addComment);
router.post('/posts/:postId/view', protect, incrementPostView);
router.post('/upload', protect, uploadFiles, uploadMediaFiles);
router.post('/posts/:id/like', protect, likePost);
router.post('/posts/:id/unlike', protect, unlikePost);

module.exports = router;