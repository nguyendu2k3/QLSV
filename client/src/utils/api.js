import axios from 'axios';

// Get avatar URL from path
export const getAvatarUrl = (path) => {
  if (!path) return null;
  
  if (path.startsWith('http')) {
    return path;
  }
  
  // Extract filename from path if it exists
  const filename = path.split('/').pop();
  return `/uploads/avatars/${filename}`;
};

// Utility function to get full URL for media (images, videos, attachments)
export const getMediaUrl = (mediaPath) => {
  if (!mediaPath) return null;
  
  // Nếu đã là URL đầy đủ, không xử lý thêm
  if (mediaPath.startsWith('http')) {
    return mediaPath;
  }
  
  // Đảm bảo path đúng định dạng dù server trả về dạng /uploads/... hay uploads/...
  let formattedPath = mediaPath;
  
  // Chuyển đổi dấu \ thành / nếu có
  formattedPath = formattedPath.replace(/\\/g, '/');
  
  // Đảm bảo path bắt đầu từ đúng thư mục
  if (!formattedPath.startsWith('/uploads/') && !formattedPath.startsWith('uploads/')) {
    formattedPath = `/uploads/${formattedPath.replace(/^\/+/, '')}`;
  }
  
  // eslint-disable-next-line no-useless-escape
  // Loại bỏ dấu / trùng lặp
  formattedPath = formattedPath.replace(/\/+/g, '/');
  
  // Nếu có / đầu tiên, giữ nguyên để đảm bảo đường dẫn hoạt động với proxy
  
  // Tạo URL hoàn chỉnh với đường dẫn tương đối
  return formattedPath;
};

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Thay đổi baseURL để trỏ trực tiếp đến server
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests - Đã sửa để xử lý lỗi token
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error adding token to request:', error);
      // Không cần throw error ở đây, cứ để request tiếp tục mà không có token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors - Đã sửa để xử lý lỗi token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Kiểm tra xem lỗi có phải 401 không
    if (error.response && error.response.status === 401) {
      try {
        localStorage.removeItem('token');
      } catch (e) {
        console.error('Error removing token from localStorage:', e);
      }
      // Kiểm tra nếu không ở trang login thì chuyển hướng
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  // Thêm API để thay đổi mật khẩu
  changePassword: (data) => api.post('/users/change-password', data),
  // Lấy bài đăng của người dùng hiện tại
  getUserPosts: () => api.get('/users/posts')
};

export const studentAPI = {
  // Lấy tất cả sinh viên
  getAllStudents: () => api.get('/students'),
  
  // Lấy thông tin sinh viên theo ID
  getStudent: (id) => api.get(`/students/${id}`),
  
  // Tạo sinh viên mới
  createStudent: (data) => api.post('/students', data),
  
  // Cập nhật thông tin sinh viên
  updateStudent: (id, data) => api.put(`/students/${id}`, data),
  
  // Xóa sinh viên
  deleteStudent: (id) => api.delete(`/students/${id}`),
  
  // Lấy thống kê sinh viên
  getStudentStats: () => api.get('/students/stats')
};

export const courseAPI = {
  // Lấy tất cả khóa học với tùy chọn filter
  getAllCourses: (filters) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      if (filters.semester) queryParams.append('semester', filters.semester);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.department) queryParams.append('department', filters.department);
    }
    const queryString = queryParams.toString();
    return api.get(`/courses${queryString ? '?' + queryString : ''}`);
  },
  
  // Lấy thông tin chi tiết của một khóa học
  getCourse: (id) => api.get(`/courses/${id}`),
  
  // Tạo khóa học mới (dành cho admin, teacher)
  createCourse: (data) => api.post('/courses', data),
  
  // Cập nhật thông tin khóa học
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  
  // Xóa khóa học
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  
  // Đăng ký khóa học (dành cho sinh viên)
  registerCourse: (courseId, data) => api.post(`/courses/${courseId}/register`, data || {}),
  
  // Hủy đăng ký khóa học (dành cho sinh viên)
  unregisterCourse: (courseId) => api.delete(`/courses/${courseId}/register`),
  
  // Lấy danh sách khóa học đã đăng ký của sinh viên hiện tại
  getMyRegisteredCourses: (filters) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      if (filters.semester) queryParams.append('semester', filters.semester);
      if (filters.status) queryParams.append('status', filters.status);
    }
    const queryString = queryParams.toString();
    return api.get(`/courses/my-courses${queryString ? '?' + queryString : ''}`);
  },
  
  // Lấy thống kê về khóa học
  getCourseStats: () => api.get('/courses/stats')
};

export const forumAPI = {
  // Lấy danh sách bài viết với hỗ trợ tham số lọc và phân trang
  getPosts: (params) => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.page) queryParams.append('page', params.page);
      if (params.category) queryParams.append('category', params.category);
      if (params.search) queryParams.append('search', params.search);
    }
    const queryString = queryParams.toString();
    return api.get(`/forum/posts${queryString ? '?' + queryString : ''}`);
  },
  
  // Lấy chi tiết bài viết theo ID
  getPostById: (postId) => api.get(`/forum/posts/${postId}`),
  
  // Tạo bài viết mới
  createPost: (data) => api.post('/forum/posts', data),
  
  // Cập nhật bài viết
  updatePost: (postId, data) => api.put(`/forum/posts/${postId}`, data),
  
  // Xóa bài viết
  deletePost: (postId) => api.delete(`/forum/posts/${postId}`),
  
  // Kiểm tra quyền xóa bài viết (cho cả admin và tác giả)
  canDeletePost: (post, currentUser) => {
    if (!post || !currentUser) return false;
    
    // Admin/superAdmin có thể xóa bất kỳ bài viết nào
    if (['admin', 'superAdmin'].includes(currentUser.role)) {
      return true;
    }
    
    // Nếu không phải admin, kiểm tra xem có phải là tác giả không
    return post.author?._id === currentUser._id;
  },
  
  // Like bài viết
  likePost: (postId) => api.post(`/forum/posts/${postId}/like`),
  
  // Unlike bài viết
  unlikePost: (postId) => api.post(`/forum/posts/${postId}/unlike`),
  
  // Bookmark bài viết
  bookmarkPost: (postId) => api.post(`/forum/posts/${postId}/bookmark`),
  
  // Tăng lượt xem bài viết
  incrementPostView: (postId) => api.post(`/forum/posts/${postId}/view`),
  
  // Lấy thống kê diễn đàn
  getForumStats: () => api.get('/forum/stats'),
  
  // Thêm comment vào bài viết (hỗ trợ cả form data với ảnh đính kèm)
  addComment: (commentData, onUploadProgress) => {
    // Kiểm tra xem commentData có phải là FormData không
    const isFormData = commentData instanceof FormData;
    
    // Nếu là FormData (có ảnh đính kèm), sử dụng Content-Type là multipart/form-data
    const config = isFormData ? {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onUploadProgress ? (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      } : undefined
    } : {};
    
    const postId = isFormData ? commentData.get('postId') : commentData.postId;
    
    return api.post(`/forum/posts/${postId}/comments`, commentData, config);
  },
  
  // Like comment
  likeComment: (postId, commentId) => api.post(`/forum/posts/${postId}/comments/${commentId}/like`),
  
  // Xóa comment
  deleteComment: (postId, commentId) => api.delete(`/forum/posts/${postId}/comments/${commentId}`),
  
  // Thêm API để tải lên các loại media
  uploadImages: (formData, onUploadProgress) => api.post('/forum/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: onUploadProgress ? (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onUploadProgress(percentCompleted);
    } : undefined
  }),
  
  uploadVideos: (formData, onUploadProgress) => api.post('/forum/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: onUploadProgress ? (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onUploadProgress(percentCompleted);
    } : undefined
  }),
  
  uploadAttachments: (formData, onUploadProgress) => api.post('/forum/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: onUploadProgress ? (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onUploadProgress(percentCompleted);
    } : undefined
  }),
  
  // Get post URL for sharing
  getPostShareUrl: (postId) => `${window.location.origin}/forum/post/${postId}`
};

export default api;