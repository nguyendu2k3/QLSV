// Import các thư viện cần thiết
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Khởi tạo express app và load biến môi trường
dotenv.config();
const app = express();

// Đảm bảo tất cả các thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, 'uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');
const imagesDir = path.join(uploadsDir, 'images');
const videosDir = path.join(uploadsDir, 'videos');
const attachmentsDir = path.join(uploadsDir, 'attachments');
const commentsDir = path.join(uploadsDir, 'comments');

// Tạo các thư mục nếu chưa tồn tại
[uploadsDir, avatarsDir, imagesDir, videosDir, attachmentsDir, commentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Tạo thư mục: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true
}));
app.use(express.json());

// Phục vụ file tĩnh từ thư mục uploads
// Điều quan trọng: Đặt middleware này TRƯỚC các routes API
console.log('Configuring static files directory:', uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// Log requests cho việc debug
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Thiết lập kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quanlysinhvien')
  .then(() => console.log('Đã kết nối với MongoDB'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));

// API Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to QuanLySinhVien API' });
});

// Auth routes
app.use('/api/auth', require('./routes/auth'));
// User routes
app.use('/api/users', require('./routes/userRoutes'));
// Forum routes
app.use('/api/forum', require('./routes/forumRoutes'));

// Xử lý lỗi
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Lỗi server',
    error: err.message
  });
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
  console.log(`Static files will be served from: ${uploadsDir}`);
});