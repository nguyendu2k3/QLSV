const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  registerCourse,
  unregisterCourse,
  getStudentCourses,
  getCourseStats
} = require('../controllers/courseController');

// Lấy thống kê về môn học - đặt route này trước để tránh xung đột pattern
router.get('/stats', protect, authorize('admin', 'superAdmin', 'teacher'), getCourseStats);

// Lấy danh sách môn học đã đăng ký của sinh viên hiện tại
router.get('/my-courses', protect, authorize('student'), getStudentCourses);

// Lấy tất cả các môn học
router.get('/', protect, getAllCourses);

// Lấy thông tin chi tiết môn học
router.get('/:id', protect, getCourse);

// Tạo môn học mới (chỉ admin và teacher)
router.post('/', protect, authorize('admin', 'superAdmin', 'teacher'), createCourse);

// Cập nhật thông tin môn học
router.put('/:id', protect, authorize('admin', 'superAdmin', 'teacher'), updateCourse);

// Xóa môn học
router.delete('/:id', protect, authorize('admin', 'superAdmin'), deleteCourse);

// Đăng ký môn học
router.post('/:courseId/register', protect, authorize('student'), registerCourse);

// Hủy đăng ký môn học
router.delete('/:courseId/register', protect, authorize('student'), unregisterCourse);

module.exports = router;