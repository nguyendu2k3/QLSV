const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, name, studentId } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ 
      $or: [
        { username }, 
        { email }, 
        { studentId }
      ] 
    });

    if (userExists) {
      if (userExists.username === username) {
        return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
      }
      if (userExists.email === email) {
        return res.status(400).json({ message: 'Email đã được sử dụng' });
      }
      if (userExists.studentId === studentId) {
        return res.status(400).json({ message: 'Mã sinh viên đã tồn tại' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      username,
      password: hashedPassword,
      email,
      name,
      studentId,
      role: 'student'
    });

    await user.save();

    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Tên đăng nhập không tồn tại' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu không đúng' });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;