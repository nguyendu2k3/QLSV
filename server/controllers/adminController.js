const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get all admins
const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách quản trị viên',
      error: error.message
    });
  }
};

// Create a new admin
const createAdmin = async (req, res) => {
  try {
    const { username, password, name, email, permissions } = req.body;
    
    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Tên đăng nhập hoặc email đã tồn tại'
      });
    }
    
    // Create new admin with specified permissions
    const admin = new User({
      username,
      password,
      name,
      email,
      role: 'admin',
      createdBy: req.user?._id,
      studentId: undefined, // Explicitly set to undefined to avoid duplicate key errors
      permissions: {
        createStudent: permissions?.createStudent || false,
        editStudent: permissions?.editStudent || false,
        deleteStudent: permissions?.deleteStudent || false,
        assignAdmin: permissions?.assignAdmin || false,
        manageForums: permissions?.manageForums || false,
        manageClasses: permissions?.manageClasses || false
      }
    });
    
    await admin.save();
    
    res.status(201).json({
      success: true,
      message: 'Tạo quản trị viên thành công',
      data: {
        _id: admin._id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo quản trị viên mới',
      error: error.message
    });
  }
};

// Update admin permissions
const updateAdminPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    
    const admin = await User.findOne({
      _id: req.params.id,
      role: 'admin'
    });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy quản trị viên'
      });
    }
    
    // Update permissions
    if (permissions) {
      admin.permissions = {
        ...admin.permissions,
        ...permissions
      };
    }
    
    await admin.save();
    
    res.json({
      success: true,
      message: 'Cập nhật quyền quản trị viên thành công',
      data: {
        _id: admin._id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật quyền quản trị viên',
      error: error.message
    });
  }
};

// Reset admin password
const resetAdminPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
      });
    }
    
    const admin = await User.findOne({
      _id: req.params.id,
      role: 'admin'
    });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy quản trị viên'
      });
    }
    
    // Update password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    
    await admin.save();
    
    res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đặt lại mật khẩu',
      error: error.message
    });
  }
};

// Get admin details
const getAdminDetails = async (req, res) => {
  try {
    const admin = await User.findOne({
      _id: req.params.id,
      role: 'admin'
    }).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy quản trị viên'
      });
    }
    
    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin quản trị viên',
      error: error.message
    });
  }
};

// Delete admin
const deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findOneAndDelete({
      _id: req.params.id,
      role: 'admin'
    });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy quản trị viên'
      });
    }
    
    res.json({
      success: true,
      message: 'Xóa quản trị viên thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa quản trị viên',
      error: error.message
    });
  }
};

// Create initial super admin (used once to set up the system)
const createSuperAdmin = async (req, res) => {
  try {
    // Check if any super admin already exists
    const superAdminExists = await User.findOne({ role: 'superAdmin' });
    if (superAdminExists) {
      return res.status(400).json({
        success: false,
        message: 'Super Admin đã tồn tại trong hệ thống'
      });
    }
    
    const { username, password, name, email } = req.body;
    
    // Create super admin with all permissions
    const superAdmin = new User({
      username,
      password,
      name,
      email,
      role: 'superAdmin',
      studentId: undefined, // Explicitly set to undefined to avoid duplicate key errors
      permissions: {
        createStudent: true,
        editStudent: true,
        deleteStudent: true,
        assignAdmin: true,
        manageForums: true,
        manageClasses: true
      }
    });
    
    await superAdmin.save();
    
    res.status(201).json({
      success: true,
      message: 'Tạo Super Admin thành công',
      data: {
        _id: superAdmin._id,
        name: superAdmin.name,
        username: superAdmin.username,
        email: superAdmin.email,
        role: superAdmin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo Super Admin',
      error: error.message
    });
  }
};

// Get admin dashboard statistics
const getAdminStats = async (req, res) => {
  try {
    // Tổng số sinh viên
    const studentCount = await User.countDocuments({ role: 'student' });
    
    // Tổng số admin
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    // Sinh viên theo trạng thái
    const activeStudents = await User.countDocuments({ 
      role: 'student', 
      status: 'active' 
    });
    
    const inactiveStudents = await User.countDocuments({ 
      role: 'student', 
      status: 'inactive' 
    });
    
    const graduatedStudents = await User.countDocuments({ 
      role: 'student', 
      status: 'graduated' 
    });
    
    const suspendedStudents = await User.countDocuments({ 
      role: 'student', 
      status: 'suspended' 
    });
    
    // Sinh viên mới trong tháng này
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    
    const newStudentsThisMonth = await User.countDocuments({
      role: 'student',
      createdAt: { $gte: firstDayOfMonth }
    });
    
    res.json({
      success: true,
      data: {
        totalStudents: studentCount,
        totalAdmins: adminCount,
        studentStatus: {
          active: activeStudents,
          inactive: inactiveStudents,
          graduated: graduatedStudents,
          suspended: suspendedStudents
        },
        newStudentsThisMonth
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê',
      error: error.message
    });
  }
};

module.exports = {
  getAllAdmins,
  createAdmin,
  updateAdminPermissions,
  resetAdminPassword,
  getAdminDetails,
  deleteAdmin,
  createSuperAdmin,
  getAdminStats
};