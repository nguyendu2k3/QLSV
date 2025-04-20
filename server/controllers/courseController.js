const Course = require('../models/Course');
const CourseRegistration = require('../models/CourseRegistration');
const mongoose = require('mongoose');

// Lấy danh sách tất cả các môn học
const getAllCourses = async (req, res) => {
  try {
    const { semester, status, department } = req.query;
    
    // Xây dựng query filter
    const filter = {};
    if (semester) filter.semester = semester;
    if (status) filter.status = status;
    if (department) filter.department = department;
    
    const courses = await Course.find(filter)
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách môn học',
      error: error.message
    });
  }
};

// Lấy thông tin chi tiết của một môn học
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy môn học'
      });
    }
    
    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin môn học',
      error: error.message
    });
  }
};

// Tạo môn học mới
const createCourse = async (req, res) => {
  try {
    const {
      courseCode,
      name,
      credits,
      description,
      department,
      instructor,
      maxStudents,
      semester,
      schedule,
      prerequisites
    } = req.body;
    
    // Kiểm tra trùng mã môn học
    const existingCourse = await Course.findOne({ courseCode });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Mã môn học đã tồn tại'
      });
    }
    
    const newCourse = new Course({
      courseCode,
      name,
      credits,
      description,
      department,
      instructor,
      maxStudents,
      semester,
      schedule,
      prerequisites
    });
    
    await newCourse.save();
    
    res.status(201).json({
      success: true,
      message: 'Tạo môn học mới thành công',
      data: newCourse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo môn học mới',
      error: error.message
    });
  }
};

// Cập nhật thông tin môn học
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const course = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy môn học'
      });
    }
    
    res.json({
      success: true,
      message: 'Cập nhật môn học thành công',
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật môn học',
      error: error.message
    });
  }
};

// Xóa môn học
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra xem môn học có sinh viên đăng ký không
    const registrations = await CourseRegistration.find({ course: id });
    if (registrations.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa môn học này vì đã có sinh viên đăng ký'
      });
    }
    
    const course = await Course.findByIdAndDelete(id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy môn học'
      });
    }
    
    res.json({
      success: true,
      message: 'Xóa môn học thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa môn học',
      error: error.message
    });
  }
};

// Đăng ký môn học
const registerCourse = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { courseId } = req.params;
    const studentId = req.user.id; // Lấy ID của người dùng hiện tại từ middleware auth
    const { semester } = req.body;
    
    // Kiểm tra môn học tồn tại
    const course = await Course.findById(courseId).session(session);
    if (!course) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy môn học'
      });
    }
    
    // Kiểm tra môn học có còn chỗ không
    if (course.enrolledStudents >= course.maxStudents) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Môn học đã đạt số lượng sinh viên tối đa'
      });
    }
    
    // Kiểm tra sinh viên đã đăng ký môn này chưa
    const existingRegistration = await CourseRegistration.findOne({
      student: studentId,
      course: courseId,
      semester: semester || course.semester
    }).session(session);
    
    if (existingRegistration) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đăng ký môn học này rồi'
      });
    }
    
    // Tạo đăng ký mới
    const registration = new CourseRegistration({
      student: studentId,
      course: courseId,
      semester: semester || course.semester,
      status: 'pending'
    });
    
    await registration.save({ session });
    
    // Tăng số lượng sinh viên đã đăng ký
    course.enrolledStudents += 1;
    await course.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({
      success: true,
      message: 'Đăng ký môn học thành công',
      data: registration
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đăng ký môn học',
      error: error.message
    });
  }
};

// Hủy đăng ký môn học
const unregisterCourse = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;
    
    // Tìm đăng ký môn học
    const registration = await CourseRegistration.findOne({
      student: studentId,
      course: courseId
    }).session(session);
    
    if (!registration) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Bạn chưa đăng ký môn học này'
      });
    }
    
    // Kiểm tra nếu đã có điểm thì không được hủy
    if (registration.grade && (registration.grade.midterm || registration.grade.final)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy đăng ký môn học đã có điểm'
      });
    }
    
    // Giảm số lượng sinh viên đã đăng ký
    const course = await Course.findById(courseId).session(session);
    if (course && course.enrolledStudents > 0) {
      course.enrolledStudents -= 1;
      await course.save({ session });
    }
    
    // Xóa đăng ký
    await CourseRegistration.findByIdAndDelete(registration._id).session(session);
    
    await session.commitTransaction();
    session.endSession();
    
    res.json({
      success: true,
      message: 'Hủy đăng ký môn học thành công'
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    res.status(500).json({
      success: false,
      message: 'Lỗi khi hủy đăng ký môn học',
      error: error.message
    });
  }
};

// Lấy danh sách môn học đã đăng ký của sinh viên
const getStudentCourses = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { semester, status } = req.query;
    
    const filter = { student: studentId };
    if (semester) filter.semester = semester;
    if (status) filter.status = status;
    
    const registrations = await CourseRegistration.find(filter)
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'name'
        }
      })
      .sort({ registrationDate: -1 });
    
    res.json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách môn học đã đăng ký',
      error: error.message
    });
  }
};

// Lấy thống kê về môn học
const getCourseStats = async (req, res) => {
  try {
    // Tổng số môn học
    const totalCourses = await Course.countDocuments();
    
    // Số môn học theo trạng thái
    const coursesByStatus = await Course.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Số môn học theo khoa
    const coursesByDepartment = await Course.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    
    // Tổng số sinh viên đăng ký
    const totalRegistrations = await CourseRegistration.countDocuments();
    
    // Số đăng ký theo trạng thái
    const registrationsByStatus = await CourseRegistration.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Lấy top 5 môn học được đăng ký nhiều nhất
    const topCourses = await Course.aggregate([
      { $sort: { enrolledStudents: -1 } },
      { $limit: 5 },
      { $project: { _id: 1, name: 1, courseCode: 1, enrolledStudents: 1, maxStudents: 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalCourses,
        coursesByStatus: coursesByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        coursesByDepartment: coursesByDepartment.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        totalRegistrations,
        registrationsByStatus: registrationsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        topCourses
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê môn học',
      error: error.message
    });
  }
};

module.exports = {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  registerCourse,
  unregisterCourse,
  getStudentCourses,
  getCourseStats
};