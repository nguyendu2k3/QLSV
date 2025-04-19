const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin', 'superAdmin'],
    default: 'student'
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  class: {
    type: String,
    default: ''
  },
  major: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated', 'suspended'],
    default: 'active'
  },
  permissions: {
    createStudent: { type: Boolean, default: false },
    editStudent: { type: Boolean, default: false },
    deleteStudent: { type: Boolean, default: false },
    assignAdmin: { type: Boolean, default: false },
    manageForums: { type: Boolean, default: false },
    manageClasses: { type: Boolean, default: false }
  },
  lastLogin: {
    type: Date,
    default: null
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Phương thức kiểm tra mật khẩu
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate a student email
userSchema.methods.generateStudentEmail = function() {
  if (this.studentId && this.name) {
    // Remove spaces and special characters from name
    const formattedName = this.name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]/g, ''); // Keep only alphanumeric chars
    
    return `${this.studentId}.${formattedName}@viu.edu.com`;
  }
  return null;
};

module.exports = mongoose.model('User', userSchema);