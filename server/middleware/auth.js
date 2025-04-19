const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để truy cập'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Không có quyền truy cập'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện hành động này'
      });
    }
    next();
  };
};

// Check specific admin permissions
const checkPermission = (permissionType) => {
  return (req, res, next) => {
    // Super admin always has all permissions
    if (req.user.role === 'superAdmin') {
      return next();
    }
    
    // For regular admins, check specific permission
    if (req.user.role === 'admin') {
      if (req.user.permissions && req.user.permissions[permissionType]) {
        return next();
      }
    }
    
    // Permission denied
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền thực hiện hành động này'
    });
  };
};

module.exports = {
  protect,
  authorize,
  checkPermission
};