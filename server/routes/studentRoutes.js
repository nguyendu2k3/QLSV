const express = require('express');
const router = express.Router();
const { protect, authorize, checkPermission } = require('../middleware/auth');
const {
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStats
} = require('../controllers/studentController');

// Get student statistics - QUAN TRỌNG: đặt trước route /:id để tránh bị nhầm lẫn pattern
router.get('/stats', protect, authorize('admin', 'superAdmin', 'student'), getStudentStats);

// Get all students - accessible by admin and superAdmin
router.get('/', protect, authorize('admin', 'superAdmin', 'teacher'), getAllStudents);

// Get a single student - accessible by admin and superAdmin
router.get('/:id', protect, authorize('admin', 'superAdmin', 'teacher'), getStudent);

// Create a new student - requires createStudent permission
router.post('/', protect, authorize('admin', 'superAdmin'), checkPermission('createStudent'), createStudent);

// Update a student - requires editStudent permission
router.put('/:id', protect, authorize('admin', 'superAdmin'), checkPermission('editStudent'), updateStudent);

// Delete a student - requires deleteStudent permission
router.delete('/:id', protect, authorize('admin', 'superAdmin'), checkPermission('deleteStudent'), deleteStudent);

module.exports = router;