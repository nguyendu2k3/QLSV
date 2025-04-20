const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Generate a unique student ID with format VIU + number
const generateStudentId = async () => {
  const latestStudent = await User.findOne({ role: 'student' })
    .sort({ studentId: -1 })
    .select('studentId');
  
  let nextNumber = 1;
  
  if (latestStudent && latestStudent.studentId) {
    const match = latestStudent.studentId.match(/VIU(\d+)/);
    if (match && match[1]) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }
  
  return `VIU${String(nextNumber).padStart(5, '0')}`;
};

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách sinh viên',
      error: error.message
    });
  }
};

// Get a single student
const getStudent = async (req, res) => {
  try {
    const student = await User.findOne({
      _id: req.params.id,
      role: 'student'
    }).select('-password');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên'
      });
    }
    
    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin sinh viên',
      error: error.message
    });
  }
};

// Create a new student
const createStudent = async (req, res) => {
  try {
    const { username, password, name, major, className, status } = req.body;
    
    // Kiểm tra username đã tồn tại chưa
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Tên đăng nhập đã tồn tại'
      });
    }
    
    // Tạo mã sinh viên tự động sử dụng hàm đã định nghĩa
    const studentId = await generateStudentId();
    
    // Tạo sinh viên mới (không cần email trong request body)
    const newStudent = new User({
      username,
      password,
      name,
      role: 'student',
      studentId,
      major,
      class: className, // Sử dụng 'class' trong DB nhưng className trong request để tránh từ khóa 'class'
      status: status || 'active'
    });
    
    // Tạo email tự động từ mã sinh viên và tên
    newStudent.email = newStudent.generateStudentEmail();
    
    await newStudent.save();
    
    return res.status(201).json({
      success: true,
      message: 'Tạo sinh viên mới thành công',
      data: {
        _id: newStudent._id,
        name: newStudent.name,
        username: newStudent.username,
        email: newStudent.email,
        studentId: newStudent.studentId,
        major: newStudent.major,
        class: newStudent.class,
        status: newStudent.status
      }
    });
  } catch (error) {
    console.error('Error creating student:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo sinh viên mới',
      error: error.message
    });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, major, className, status } = req.body;
    
    const updatedData = {
      name,
      email,
      major,
      status
    };
    
    if (className) {
      updatedData.class = className;
    }
    
    const student = await User.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin sinh viên thành công',
      data: student
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật thông tin sinh viên',
      error: error.message
    });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await User.findById(id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên'
      });
    }
    
    if (student.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'ID cung cấp không phải là sinh viên'
      });
    }
    
    await User.findByIdAndDelete(id);
    
    return res.status(200).json({
      success: true,
      message: 'Xóa sinh viên thành công'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa sinh viên',
      error: error.message
    });
  }
};

// Get student statistics
const getStudentStats = async (req, res) => {
  try {
    // Đếm tổng số sinh viên
    const totalStudents = await User.countDocuments({ role: 'student' });
    
    // Lấy thông tin về các trạng thái sinh viên
    const statusStats = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Chuyển đổi kết quả từ aggregate thành đối tượng dễ sử dụng
    const studentStatus = {
      active: 0,
      inactive: 0,
      graduated: 0,
      suspended: 0
    };
    
    statusStats.forEach(stat => {
      if (stat._id && studentStatus.hasOwnProperty(stat._id)) {
        studentStatus[stat._id] = stat.count;
      }
    });
    
    // Tính số sinh viên mới trong tháng này
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const newStudentsThisMonth = await User.countDocuments({
      role: 'student',
      createdAt: { $gte: firstDayOfMonth }
    });
    
    // Giả định số lượng bài tập cho mỗi sinh viên
    const totalAssignments = 45; // Giá trị mẫu
    
    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        studentStatus,
        newStudentsThisMonth,
        totalAssignments,
        activeStudents: studentStatus.active,
        graduatedStudents: studentStatus.graduated
      }
    });
  } catch (error) {
    console.error('Error getting student statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê sinh viên',
      error: error.message
    });
  }
};

module.exports = {
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStats
};