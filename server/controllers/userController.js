const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Thêm import bcryptjs

// Tạo token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Đăng ký tài khoản
const register = async (req, res) => {
  try {
    const { username, email, password, name, studentId } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email hoặc tên đăng nhập đã tồn tại'
      });
    }

    // Mã hóa mật khẩu trước khi lưu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo mã số sinh viên theo định dạng VIU+number
    // Lấy số lượng người dùng hiện tại để tạo số thứ tự
    const userCount = await User.countDocuments();
    const formattedStudentId = `VIU${String(userCount + 1).padStart(4, '0')}`;

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      name,
      studentId: formattedStudentId // Sử dụng mã sinh viên đã định dạng
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        studentId: user.studentId // Trả về mã sinh viên đã định dạng
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Đăng nhập
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác'
      });
    }

    // Sửa phương thức so sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        studentId: user.studentId, // Trả về mã sinh viên trong response
        avatar: user.avatar // Thêm avatar vào response khi đăng nhập
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Lấy thông tin profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Lấy thông tin profile của một người dùng khác
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Validate userId
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const user = await User.findById(userId).select('-password -permissions -__v');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Cập nhật profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    const { name, email, bio } = req.body;
    user.name = name || user.name;
    user.email = email || user.email;
    user.bio = bio !== undefined ? bio : user.bio; // Thêm trường bio

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        bio: user.bio, // Trả về trường bio trong response
        studentId: user.studentId,
        avatar: user.avatar // Thêm avatar vào response khi cập nhật
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Upload avatar
const uploadAvatar = async (req, res) => {
  try {
    // Giả sử bạn đã có middleware xử lý upload file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy file upload'
      });
    }

    console.log('File avatar đã upload:', req.file);

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Tạo đường dẫn tương đối thay vì sử dụng đường dẫn tuyệt đối
    const relativePath = `uploads/avatars/${req.file.filename}`;
    console.log('Đường dẫn avatar tương đối:', relativePath);

    // Lưu đường dẫn tương đối
    user.avatar = relativePath;
    await user.save();

    res.json({
      success: true,
      message: 'Upload avatar thành công',
      avatarUrl: relativePath
    });
  } catch (error) {
    console.error('Lỗi upload avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Đổi mật khẩu
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin mật khẩu'
      });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    
    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu hiện tại không chính xác'
      });
    }
    
    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đổi mật khẩu',
      error: error.message
    });
  }
};

// Lấy bài viết của người dùng
const getUserPosts = async (req, res) => {
  try {
    // Import Forum model
    const ForumPost = require('../models/Forum');
    
    // Find posts where author matches the current user's ID
    const posts = await ForumPost.find({ author: req.user.id })
      .sort({ createdAt: -1 })
      .populate('author', 'name username avatar')
      .populate('comments.author', 'name username avatar');
    
    res.json({
      success: true,
      posts
    });
  } catch (error) {
    console.error('Lỗi khi lấy bài viết của người dùng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy bài viết',
      error: error.message
    });
  }
};

// Lấy bài viết của một người dùng khác
const getUserPostsById = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Validate userId
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Import Forum model
    const ForumPost = require('../models/Forum');
    
    // Find posts where author matches the specified user ID
    const posts = await ForumPost.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate('author', 'name username avatar')
      .populate('comments.author', 'name username avatar');
    
    res.json({
      success: true,
      posts
    });
  } catch (error) {
    console.error('Lỗi khi lấy bài viết của người dùng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy bài viết',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getUserProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  getUserPosts,
  getUserPostsById
};