// Import các thư viện cần thiết
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Khởi tạo express app và load biến môi trường
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
});