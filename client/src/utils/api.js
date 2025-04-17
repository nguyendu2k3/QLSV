import axios from 'axios';

// Utility function to get full URL for avatar
export const getAvatarUrl = (avatarPath) => {
  console.log("Original avatar path:", avatarPath);
  
  if (!avatarPath) {
    console.log("No avatar path provided");
    return null;
  }
  
  if (avatarPath.startsWith('http')) {
    console.log("Avatar path already starts with http:", avatarPath);
    return avatarPath;
  }
  
  // For cases where the avatar is just a filename (especially in comments)
  if (!avatarPath.includes('/') && !avatarPath.includes('\\')) {
    console.log("Simple filename detected:", avatarPath);
    return `http://localhost:5000/uploads/avatars/${avatarPath}`;
  }
  
  // Xử lý đường dẫn tuyệt đối từ server
  if (avatarPath.includes(':\\') || avatarPath.includes(':/')) {
    // Đây là đường dẫn tuyệt đối Windows hoặc UNIX
    // Lấy tên file từ đường dẫn
    const filename = avatarPath.split(/[\/\\]/).pop();
    console.log("Extracted filename from absolute path:", filename);
    
    // Tạo đường dẫn tương đối từ tên file
    const relativePath = `uploads/avatars/${filename}`;
    console.log("Converted to relative path:", relativePath);
    
    return `http://localhost:5000/${relativePath}`;
  }
  
  // Chuyển đổi dấu \ thành / nếu có
  let formattedPath = avatarPath.replace(/\\/g, '/');
  console.log("Path after backslash replacement:", formattedPath);
  
  // Xử lý trường hợp khi server trả về đường dẫn tương đối (không bắt đầu với uploads)
  if (!formattedPath.includes('uploads')) {
    formattedPath = `uploads/avatars/${formattedPath.split('/').pop() || formattedPath}`;
    console.log("Path after adding uploads/avatars:", formattedPath);
  }
  
  // eslint-disable-next-line no-useless-escape
  // Loại bỏ dấu / trùng lặp
  formattedPath = formattedPath.replace(/\/+/g, '/');
  console.log("Path after duplicate slash removal:", formattedPath);
  
  // Nếu có / đầu tiên, loại bỏ để tránh đường dẫn tuyệt đối
  formattedPath = formattedPath.startsWith('/') ? formattedPath.slice(1) : formattedPath;
  console.log("Path after leading slash removal:", formattedPath);
  
  // Tạo URL hoàn chỉnh
  const fullUrl = `http://localhost:5000/${formattedPath}`;
  console.log("Final avatar URL:", fullUrl);
  
  return fullUrl;
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
  
  // Nếu có / đầu tiên, loại bỏ để tránh đường dẫn tuyệt đối
  formattedPath = formattedPath.startsWith('/') ? formattedPath.slice(1) : formattedPath;
  
  // Tạo URL hoàn chỉnh
  const fullUrl = `http://localhost:5000/${formattedPath}`;
  
  return fullUrl;
};

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
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
  })
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
  
  // Like bài viết
  likePost: (postId) => api.post(`/forum/posts/${postId}/like`),
  
  // Unlike bài viết
  unlikePost: (postId) => api.post(`/forum/posts/${postId}/unlike`),
  
  // Bookmark bài viết
  bookmarkPost: (postId) => api.post(`/forum/posts/${postId}/bookmark`),
  
  // Tăng lượt xem bài viết
  incrementPostView: (postId) => api.post(`/forum/posts/${postId}/view`),
  
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