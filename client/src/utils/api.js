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
  baseURL: '/api',
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
  getProfile: (userId) => userId ? api.get(`/users/profile/${userId}`) : api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  // Thêm API để thay đổi mật khẩu
  changePassword: (data) => api.post('/users/change-password', data),
  // Lấy bài đăng của người dùng (nếu có userId thì lấy của user đó, không thì lấy của user hiện tại)
  getUserPosts: (userId) => userId ? api.get(`/users/posts/${userId}`) : api.get('/users/posts')
};

export const forumAPI = {
  // Lấy danh sách bài viết 
  getPosts: () => api.get('/forum/posts'),
  
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