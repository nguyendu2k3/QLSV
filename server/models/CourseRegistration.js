const mongoose = require('mongoose');

const CourseRegistrationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  semester: {
    type: String,
    required: true,
    trim: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'withdrawn'],
    default: 'pending'
  },
  grade: {
    midterm: {
      type: Number,
      min: 0,
      max: 10
    },
    final: {
      type: Number,
      min: 0,
      max: 10
    },
    average: {
      type: Number,
      min: 0,
      max: 10
    },
    letterGrade: {
      type: String,
      enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F']
    }
  },
  attendance: {
    present: {
      type: Number,
      default: 0
    },
    absent: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  notes: {
    type: String
  },
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

// Đảm bảo mỗi sinh viên chỉ đăng ký mỗi môn học một lần trong một học kỳ
CourseRegistrationSchema.index({ student: 1, course: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('CourseRegistration', CourseRegistrationSchema);