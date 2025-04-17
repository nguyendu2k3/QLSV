import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Avatar,
  Typography,
  Divider,
  IconButton,
  Stack,
  useTheme,
  Tab,
  Tabs,
  CircularProgress,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Close,
  VideoLibrary,
  InsertPhoto,
  VideoCall,
  Attachment
} from '@mui/icons-material';
import { getAvatarUrl, getMediaUrl, forumAPI } from '../../utils/api';

const CreatePost = ({ open, onClose, onSubmit, categories, userData }) => {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const quillRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: categories[0],
    images: [],
    videos: [],
    attachments: []
  });
  const [currentTab, setCurrentTab] = useState(0);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Tạo data mới để đảm bảo các trường media luôn là mảng
    const postData = {
      ...formData,
      images: Array.isArray(formData.images) ? formData.images : [],
      videos: Array.isArray(formData.videos) ? formData.videos : [],
      attachments: Array.isArray(formData.attachments) ? formData.attachments : []
    };
    
    // Gọi hàm onSubmit với dữ liệu đã được xử lý
    onSubmit(postData);
    
    // Reset form
    setFormData({
      title: '',
      content: '',
      category: categories[0],
      images: [],
      videos: [],
      attachments: []
    });
    setPreviewImages([]);
    setCurrentTab(0);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleContentChange = (content) => {
    setFormData({
      ...formData,
      content: content
    });
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingMedia(true);
    setUploadProgress(0);
    setError('');

    try {
      console.log('Bắt đầu tải lên', files.length, 'hình ảnh');
      
      // Kiểm tra kích thước file
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File "${file.name}" quá lớn. Kích thước tối đa là 10MB.`);
        }
      }

      // Tạo FormData để gửi lên server
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      // Gọi API để tải lên ảnh
      const response = await forumAPI.uploadImages(formData, (progress) => {
        setUploadProgress(progress);
      });

      console.log('Phản hồi từ server:', response.data);

      if (response && response.data && response.data.success) {
        const uploadedImages = response.data.data.images || [];
        console.log('Ảnh đã tải lên thành công:', uploadedImages);

        // Make sure we get the complete URL for images
        const newPreviewImages = uploadedImages.map(image => {
          console.log('Image URL before processing:', image.url);
          const fullUrl = getMediaUrl(image.url);
          console.log('Full image URL after processing:', fullUrl);
          return fullUrl;
        });
        setPreviewImages(prevImages => [...prevImages, ...newPreviewImages]);
        
        // Đảm bảo formData.images là một mảng trước khi cập nhật
        const currentImages = Array.isArray(formData.images) ? formData.images : [];
        
        // Cập nhật formData với thông tin ảnh từ server
        setFormData(prevFormData => ({
          ...prevFormData,
          images: [...currentImages, ...uploadedImages]
        }));

        setShowSnackbar(true);
        setSnackbarMessage('Đã tải lên ảnh thành công');
      } else {
        throw new Error('Không nhận được phản hồi thành công từ server');
      }
    } catch (error) {
      console.error('Lỗi tải ảnh lên:', error);
      // Hiển thị thông báo lỗi chi tiết hơn
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Không thể tải lên hình ảnh. Vui lòng thử lại!';
      setError(`Lỗi tải lên: ${errorMessage}`);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingMedia(true);
    setUploadProgress(0);
    setError('');

    try {
      console.log('Bắt đầu tải lên', files.length, 'video');
      
      // Kiểm tra kích thước file
      for (const file of files) {
        if (file.size > 100 * 1024 * 1024) { // Giới hạn 100MB cho video
          throw new Error(`File "${file.name}" quá lớn. Kích thước tối đa là 100MB.`);
        }
      }

      // Tạo FormData để gửi lên server
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('videos', file);
      });

      // Gọi API để tải lên video
      const response = await forumAPI.uploadVideos(formData, (progress) => {
        setUploadProgress(progress);
      });

      console.log('Phản hồi từ server:', response.data);

      if (response && response.data && response.data.success) {
        const uploadedVideos = response.data.data.videos || [];
        console.log('Video đã tải lên thành công:', uploadedVideos);
        
        // Đảm bảo formData.videos là một mảng trước khi cập nhật
        const currentVideos = Array.isArray(formData.videos) ? formData.videos : [];
        
        // Cập nhật formData với thông tin video từ server
        setFormData(prevFormData => ({
          ...prevFormData,
          videos: [...currentVideos, ...uploadedVideos]
        }));

        setShowSnackbar(true);
        setSnackbarMessage('Đã tải lên video thành công');
      } else {
        throw new Error('Không nhận được phản hồi thành công từ server');
      }
    } catch (error) {
      console.error('Lỗi tải video lên:', error);
      const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Không thể tải lên video. Vui lòng thử lại!';
      setError(`Lỗi tải lên: ${errorMessage}`);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleAttachmentUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingMedia(true);
    setUploadProgress(0);
    setError('');

    try {
      // Tạo FormData để gửi lên server
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('attachments', file);
      });

      // Gọi API để tải lên tệp đính kèm
      const response = await forumAPI.uploadAttachments(formData, (progress) => {
        setUploadProgress(progress);
      });

      if (response && response.data && response.data.success) {
        const uploadedAttachments = response.data.data.attachments || [];
        
        // Cập nhật formData với thông tin tệp đính kèm từ server
        setFormData({
          ...formData,
          attachments: [...formData.attachments, ...uploadedAttachments]
        });

        setShowSnackbar(true);
        setSnackbarMessage('Đã tải lên tệp đính kèm thành công');
      }
    } catch (error) {
      console.error('Error uploading attachments:', error);
      setError('Không thể tải lên tệp đính kèm. Vui lòng thử lại!');
    } finally {
      setUploadingMedia(false);
    }
  };

  const removeMedia = (type, index) => {
    if (type === 'image') {
      const newImages = [...formData.images];
      newImages.splice(index, 1);
      
      // Xóa preview image tương ứng nếu có
      if (index < previewImages.length) {
        const newPreviewImages = [...previewImages];
        const previewUrl = newPreviewImages.splice(index, 1)[0];
        
        // Nếu là URL object đã tạo, thì revoke để tránh memory leak
        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }
        
        setPreviewImages(newPreviewImages);
      }
      
      setFormData({
        ...formData,
        images: newImages
      });
      
      setShowSnackbar(true);
      setSnackbarMessage('Đã xóa hình ảnh');
      
    } else if (type === 'video') {
      const newVideos = [...formData.videos];
      newVideos.splice(index, 1);
      setFormData({
        ...formData,
        videos: newVideos
      });
      
      setShowSnackbar(true);
      setSnackbarMessage('Đã xóa video');
      
    } else if (type === 'attachment') {
      const newAttachments = [...formData.attachments];
      newAttachments.splice(index, 1);
      setFormData({
        ...formData,
        attachments: newAttachments
      });
      
      setShowSnackbar(true);
      setSnackbarMessage('Đã xóa tệp đính kèm');
    }
  };

  // Cấu hình ReactQuill - chỉ định nghĩa một lần, không thay đổi giữa các render
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      [{'align': []}, {'indent': '-1'}, {'indent': '+1'}],
      [{'color': []}, {'background': []}],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'indent', 'align',
    'color', 'background',
    'link'
  ];

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
        }
      }}
    >
      <DialogTitle sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold" align="center" sx={{ flexGrow: 1 }}>
            Tạo bài viết
          </Typography>
          <IconButton 
            onClick={onClose}
            size="small"
            sx={{ 
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              '&:hover': { 
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)' 
              }
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      
      {/* User info */}
      {userData && (
        <Box sx={{ px: 3, pt: 2, pb: 1, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar 
              src={getAvatarUrl(userData.avatar)}
              sx={{ width: 40, height: 40 }}
            >
              {userData?.name?.charAt(0)}
            </Avatar>
            <Typography variant="subtitle1" fontWeight="medium">
              {userData.name}
            </Typography>
          </Box>
        </Box>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 3, py: 2 }}>
          {/* Hiển thị thông báo lỗi nếu có */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Bài viết" sx={{ textTransform: 'none', fontWeight: 'medium' }} />
            <Tab label="Danh mục" sx={{ textTransform: 'none', fontWeight: 'medium' }} />
          </Tabs>

          {currentTab === 0 ? (
            /* Tab bài viết */
            <>
              <TextField
                autoFocus
                placeholder="Tiêu đề bài viết"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                required
                InputProps={{
                  sx: { 
                    fontSize: '1.1rem', 
                    fontWeight: 'medium',
                    borderRadius: 1.5,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    '&.Mui-focused': {
                      backgroundColor: theme.palette.background.paper
                    }
                  }
                }}
                sx={{ mb: 2 }}
              />
              
              {/* Rich text editor */}
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={formData.content}
                onChange={handleContentChange}
                modules={modules}
                formats={formats}
                placeholder="Nội dung bài viết..."
                style={{ 
                  height: '250px',
                  marginBottom: '40px',
                  borderRadius: '8px',
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                }}
              />
              
              {/* Preview uploaded images */}
              {formData.images.length > 0 && (
                <Box sx={{ mt: 3, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Hình ảnh đã tải lên
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.images.map((image, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          position: 'relative',
                          width: 100,
                          height: 100,
                          borderRadius: 2,
                          overflow: 'hidden'
                        }}
                      >
                        <img 
                          src={image.url ? `http://localhost:5000/${image.url.replace(/^\/+/, '')}` : ''}
                          alt={image.name || `Image ${index}`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            console.error("Lỗi tải ảnh:", e);
                            console.error("URL ảnh:", image.url);
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/100?text=Lỗi';
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            color: 'white',
                            p: 0.5,
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.8)'
                            }
                          }}
                          onClick={() => removeMedia('image', index)}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              
              {/* Preview uploaded videos */}
              {formData.videos.length > 0 && (
                <Box sx={{ mt: 3, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Video đã tải lên
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.videos.map((video, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          position: 'relative',
                          width: 200,
                          borderRadius: 2,
                          overflow: 'hidden',
                          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                          p: 1
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <VideoLibrary fontSize="small" />
                          <Typography variant="body2" noWrap>{video.name}</Typography>
                        </Box>
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            p: 0.5
                          }}
                          onClick={() => removeMedia('video', index)}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              
              {/* Preview attachments */}
              {formData.attachments.length > 0 && (
                <Box sx={{ mt: 3, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tệp đính kèm
                  </Typography>
                  <Stack spacing={1}>
                    {formData.attachments.map((file, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1,
                          borderRadius: 1,
                          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Attachment fontSize="small" />
                          <Box>
                            <Typography variant="body2">{file.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatFileSize(file.size)}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => removeMedia('attachment', index)}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
              
              {/* Upload progress indicator */}
              {uploadingMedia && (
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} variant="determinate" value={uploadProgress} />
                    <Typography variant="body2">
                      Đang tải lên... {uploadProgress}%
                    </Typography>
                  </Box>
                </Box>
              )}
              
              {/* Media buttons */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  mt: 3,
                  p: 1.5,
                  border: 1,
                  borderColor: theme.palette.divider,
                  borderRadius: 2
                }}
              >
                <Typography variant="body2" sx={{ alignSelf: 'center', flexGrow: 1 }}>
                  Thêm vào bài viết:
                </Typography>
                
                <Tooltip title="Thêm hình ảnh">
                  <IconButton 
                    color="success" 
                    size="small" 
                    sx={{ backgroundColor: 'rgba(76, 175, 80, 0.1)' }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingMedia}
                  >
                    <InsertPhoto fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                />
                
                <Tooltip title="Thêm video">
                  <IconButton 
                    color="error" 
                    size="small" 
                    sx={{ backgroundColor: 'rgba(244, 67, 54, 0.1)' }}
                    onClick={() => videoInputRef.current?.click()}
                    disabled={uploadingMedia}
                  >
                    <VideoCall fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  style={{ display: 'none' }}
                  ref={videoInputRef}
                />
                
                <Tooltip title="Đính kèm tệp">
                  <IconButton 
                    color="primary" 
                    size="small" 
                    sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)' }}
                    onClick={() => attachmentInputRef.current?.click()}
                    disabled={uploadingMedia}
                  >
                    <Attachment fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <input
                  type="file"
                  multiple
                  onChange={handleAttachmentUpload}
                  style={{ display: 'none' }}
                  ref={attachmentInputRef}
                />
              </Box>
            </>
          ) : (
            /* Tab danh mục */
            <>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="category-label">Danh mục</InputLabel>
                <Select
                  labelId="category-label"
                  id="category-select"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Danh mục"
                  required
                  sx={{ borderRadius: 1.5 }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Typography variant="body2" color="text.secondary">
                Chọn một danh mục phù hợp để phân loại bài viết của bạn, giúp người đọc dễ dàng tìm thấy nội dung.
              </Typography>
            </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, justifyContent: currentTab === 0 ? 'space-between' : 'flex-end' }}>
          {currentTab === 0 ? (
            <>
              <Button 
                onClick={() => setCurrentTab(1)}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Chọn danh mục
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={!formData.title || !formData.content || uploadingMedia}
                sx={{ textTransform: 'none', borderRadius: 5, px: 3 }}
              >
                Đăng bài
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={() => setCurrentTab(0)}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Quay lại
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={!formData.title || !formData.content || uploadingMedia}
                sx={{ textTransform: 'none', borderRadius: 5, px: 3 }}
              >
                Đăng bài
              </Button>
            </>
          )}
        </DialogActions>
      </Box>
      
      {/* Snackbar để hiển thị thông báo */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Dialog>
  );
};

export default CreatePost;