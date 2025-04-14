const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  addComment
} = require('../controllers/forumController');
const { protect } = require('../middleware/auth');

router.post('/posts', protect, createPost);
router.get('/posts', protect, getPosts);
router.post('/posts/:postId/comments', protect, addComment);

module.exports = router;