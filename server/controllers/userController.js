const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Thêm import bcryptjs
const mongoose = require('mongoose');

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

// Lấy thông tin của người dùng qua userId
const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Kiểm tra userId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID người dùng không hợp lệ'
      });
    }

    // Tìm người dùng theo ID, loại trừ trường password
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Kiểm tra xem người dùng hiện tại có đang theo dõi người dùng này hay không
    let isFollowing = false;
    if (req.user && req.user.id) {
      const currentUser = await User.findById(req.user.id);
      if (currentUser && currentUser.following && currentUser.following.includes(userId)) {
        isFollowing = true;
      }
    }

    res.json({
      success: true,
      user,
      isFollowing
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin người dùng',
      error: error.message
    });
  }
};

// Lấy bài viết của người dùng qua userId
const getUserPostsById = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Kiểm tra userId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID người dùng không hợp lệ'
      });
    }

    // Kiểm tra người dùng có tồn tại không
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    
    // Import Forum model
    const ForumPost = require('../models/Forum');
    
    // Tìm tất cả bài viết của người dùng (không bao gồm bài viết bị ẩn)
    const posts = await ForumPost.find({ 
      author: userId,
      isHidden: { $ne: true } 
    })
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

// Theo dõi người dùng
const followUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.user.id;
    
    // Ngăn người dùng tự theo dõi mình
    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể tự theo dõi chính mình'
      });
    }

    // Kiểm tra userId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID người dùng không hợp lệ'
      });
    }

    // Kiểm tra người dùng có tồn tại không
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng để theo dõi'
      });
    }

    // Cập nhật thông tin theo dõi của người dùng hiện tại
    const currentUser = await User.findById(currentUserId);
    
    // Kiểm tra xem đã theo dõi chưa
    if (currentUser.following && currentUser.following.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã theo dõi người dùng này'
      });
    }

    // Thêm vào danh sách following của người dùng hiện tại
    if (!currentUser.following) {
      currentUser.following = [userId];
    } else {
      currentUser.following.push(userId);
    }
    await currentUser.save();

    // Thêm vào danh sách followers của người dùng được theo dõi
    if (!userToFollow.followers) {
      userToFollow.followers = [currentUserId];
    } else {
      userToFollow.followers.push(currentUserId);
    }
    await userToFollow.save();

    res.json({
      success: true,
      message: 'Đã theo dõi người dùng',
      following: true
    });
  } catch (error) {
    console.error('Lỗi khi theo dõi người dùng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi theo dõi người dùng',
      error: error.message
    });
  }
};

// Hủy theo dõi người dùng
const unfollowUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.user.id;

    // Kiểm tra người dùng có tồn tại không
    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng để hủy theo dõi'
      });
    }

    // Xóa userId khỏi mảng following của người dùng hiện tại
    await User.findByIdAndUpdate(
      currentUserId,
      { $pull: { following: userId } }
    );

    // Xóa currentUserId khỏi mảng followers của người dùng đó
    await User.findByIdAndUpdate(
      userId,
      { $pull: { followers: currentUserId } }
    );

    res.json({
      success: true,
      message: 'Đã hủy theo dõi người dùng',
      following: false
    });
  } catch (error) {
    console.error('Lỗi khi hủy theo dõi người dùng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi hủy theo dõi người dùng',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  getUserPosts,
  getUserById,
  getUserPostsById,
  followUser,
  unfollowUser
};