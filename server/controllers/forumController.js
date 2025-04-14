const ForumPost = require('../models/Forum');

// Tạo bài viết mới
exports.createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    const post = await ForumPost.create({
      title,
      content,
      category,
      author: req.user.id
    });

    await post.populate('author', 'name username');

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Lấy danh sách bài viết
exports.getPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find()
      .populate('author', 'name username')
      .sort('-createdAt');

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Thêm bình luận
exports.addComment = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    const comment = {
      content: req.body.content,
      author: req.user.id
    };

    post.comments.push(comment);
    await post.save();

    await post.populate('comments.author', 'name username');

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};