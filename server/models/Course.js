const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: [true, 'Mã môn học là bắt buộc'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Tên môn học là bắt buộc'],
    trim: true
  },
  credits: {
    type: Number,
    required: [true, 'Số tín chỉ là bắt buộc'],
    min: [1, 'Số tín chỉ tối thiểu là 1']
  },
  description: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Khoa/bộ môn là bắt buộc'],
    trim: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  maxStudents: {
    type: Number,
    default: 50
  },
  enrolledStudents: {
    type: Number,
    default: 0
  },
  semester: {
    type: String,
    required: [true, 'Học kỳ là bắt buộc'],
    trim: true
  },
  schedule: {
    dayOfWeek: {
      type: String,
      enum: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
    },
    startTime: String,
    endTime: String,
    room: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active'
  },
  prerequisites: [{
    type: String,
    ref: 'Course'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', CourseSchema);