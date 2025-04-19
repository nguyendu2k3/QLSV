const express = require('express');
const router = express.Router();
const { protect, authorize, checkPermission } = require('../middleware/auth');
const {
  getAllAdmins,
  createAdmin,
  updateAdminPermissions,
  resetAdminPassword,
  getAdminDetails,
  deleteAdmin,
  createSuperAdmin,
  getAdminStats
} = require('../controllers/adminController');

// Get all admins - only accessible by superAdmin
router.get('/', protect, authorize('superAdmin'), getAllAdmins);

// Get admin stats - accessible by superAdmin and admins with assignAdmin permission
router.get('/stats', protect, authorize('superAdmin', 'admin'), checkPermission('assignAdmin'), getAdminStats);

// Get admin details - only accessible by superAdmin
router.get('/:id', protect, authorize('superAdmin'), getAdminDetails);

// Create a new admin - only accessible by superAdmin
router.post('/', protect, authorize('superAdmin'), createAdmin);

// Create initial superAdmin (to be used only during setup)
router.post('/setup-super-admin', createSuperAdmin);

// Update admin permissions - only accessible by superAdmin
router.put('/:id/permissions', protect, authorize('superAdmin'), updateAdminPermissions);

// Reset admin password - only accessible by superAdmin
router.put('/:id/reset-password', protect, authorize('superAdmin'), resetAdminPassword);

// Delete admin - only accessible by superAdmin
router.delete('/:id', protect, authorize('superAdmin'), deleteAdmin);

module.exports = router;