import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { forumAPI, getAvatarUrl, getMediaUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Box,
  Snackbar,
  Paper,
  Divider,
  Avatar,
  IconButton,
  Stack,
  Alert,
  Tabs,
  Tab,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  Close,
  VideoLibrary,
  InsertPhoto,
  VideoCall,
  Attachment,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const EditPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Refs for file inputs
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const quillRef = useRef(null);

  // State variables
  const [post, setPost] = useState({
    title: '',
    content: '',
    category: '',
    images: [],
    videos: [],
    attachments: []
  });
  const [originalPost, setOriginalPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentTab, setCurrentTab] = useState(0);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImages, setPreviewImages] = useState([]);

  // Categories list
  const [categories] = useState([
    'Thông báo',
    'Hỏi đáp',
    'Chia sẻ',
    'Tài liệu',
    'Thảo luận',
    'Khác'
  ]);

  // Fetch post data when component mounts
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const response = await forumAPI.getPostById(postId);
        if (response.data && response.data.success) {
          const postData = response.data.data;
          setPost({
            title: postData.title,
            content: postData.content,
            category: postData.category || categories[0],
            images: postData.images || [],
            videos: postData.videos || [],
            attachments: postData.attachments || []
          });
          setOriginalPost(postData);
          
          // Set preview images if there are any
          if (postData.images && postData.images.length > 0) {
            const previews = postData.images.map(image => getMediaUrl(image.url));
            setPreviewImages(previews);
          }
        } else {
          setError('Không thể tải bài viết');
        }
      } catch (error) {
        console.error('Lỗi khi tải bài viết:', error);
        setError('Lỗi khi tải bài viết');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, categories]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPost((prev) => ({ ...prev, [name]: value }));
  };

  // Handle content changes from the rich text editor
  const handleContentChange = (content) => {
    setPost((prev) => ({ ...prev, content }));
  };

  // Handle tab changes
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Handle form submission
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await forumAPI.updatePost(postId, post);
      if (response.data && response.data.success) {
        setSnackbar({
          open: true,
          message: 'Cập nhật bài viết thành công',
          severity: 'success'
        });
        setTimeout(() => navigate(`/forum/post/${postId}`), 1500);
      } else {
        throw new Error('Không thể cập nhật bài viết');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật bài viết:', error);
      setSnackbar({
        open: true,
        message: 'Lỗi khi cập nhật bài viết: ' + (error.message || 'Không xác định'),
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle image upload
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

      if (response && response.data && response.data.success) {
        const uploadedImages = response.data.data.images || [];

        // Make sure we get the complete URL for images
        const newPreviewImages = uploadedImages.map(image => getMediaUrl(image.url));
        setPreviewImages(prevImages => [...prevImages, ...newPreviewImages]);
        
        // Đảm bảo post.images là một mảng trước khi cập nhật
        const currentImages = Array.isArray(post.images) ? post.images : [];
        
        // Cập nhật post với thông tin ảnh từ server
        setPost(prevPost => ({
          ...prevPost,
          images: [...currentImages, ...uploadedImages]
        }));

        setSnackbar({
          open: true,
          message: 'Đã tải lên ảnh thành công',
          severity: 'success'
        });
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

  // Handle video upload
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

      if (response && response.data && response.data.success) {
        const uploadedVideos = response.data.data.videos || [];
        
        // Đảm bảo post.videos là một mảng trước khi cập nhật
        const currentVideos = Array.isArray(post.videos) ? post.videos : [];
        
        // Cập nhật post với thông tin video từ server
        setPost(prevPost => ({
          ...prevPost,
          videos: [...currentVideos, ...uploadedVideos]
        }));

        setSnackbar({
          open: true,
          message: 'Đã tải lên video thành công',
          severity: 'success'
        });
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

  // Handle attachment upload
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
        
        // Cập nhật post với thông tin tệp đính kèm từ server
        setPost(prevPost => ({
          ...prevPost,
          attachments: [...prevPost.attachments, ...uploadedAttachments]
        }));

        setSnackbar({
          open: true,
          message: 'Đã tải lên tệp đính kèm thành công',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Lỗi tải tệp đính kèm lên:', error);
      setError('Không thể tải lên tệp đính kèm. Vui lòng thử lại!');
    } finally {
      setUploadingMedia(false);
    }
  };

  // Remove media (image, video, or attachment)
  const removeMedia = (type, index) => {
    if (type === 'image') {
      const newImages = [...post.images];
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
      
      setPost(prevPost => ({
        ...prevPost,
        images: newImages
      }));
      
      setSnackbar({
        open: true,
        message: 'Đã xóa hình ảnh',
        severity: 'info'
      });
      
    } else if (type === 'video') {
      const newVideos = [...post.videos];
      newVideos.splice(index, 1);
      setPost(prevPost => ({
        ...prevPost,
        videos: newVideos
      }));
      
      setSnackbar({
        open: true,
        message: 'Đã xóa video',
        severity: 'info'
      });
      
    } else if (type === 'attachment') {
      const newAttachments = [...post.attachments];
      newAttachments.splice(index, 1);
      setPost(prevPost => ({
        ...prevPost,
        attachments: newAttachments
      }));
      
      setSnackbar({
        open: true,
        message: 'Đã xóa tệp đính kèm',
        severity: 'info'
      });
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  // ReactQuill modules configuration
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          component={Link}
          to="/forum"
          startIcon={<ArrowBack />}
        >
          Quay lại diễn đàn
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              Chỉnh sửa bài viết
            </Typography>
            <Button
              variant="outlined"
              component={Link}
              to={`/forum/post/${postId}`}
              startIcon={<ArrowBack />}
            >
              Quay lại
            </Button>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          {originalPost && originalPost.author && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar 
                src={getAvatarUrl(originalPost.author.avatar)} 
                sx={{ width: 40, height: 40, mr: 2 }}
              >
                {originalPost.author?.name?.charAt(0)}
              </Avatar>
              <Typography variant="subtitle1">
                {originalPost.author.name}
              </Typography>
            </Box>
          )}
          
          {/* Form */}
          <Box component="form" onSubmit={handleSave}>
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
              <>
                <TextField
                  placeholder="Tiêu đề bài viết"
                  name="title"
                  value={post.title}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  required
                  InputProps={{
                    sx: { fontSize: '1.1rem', fontWeight: 'medium', borderRadius: 1.5 }
                  }}
                  sx={{ mb: 2 }}
                />
                
                {/* Rich text editor */}
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={post.content}
                  onChange={handleContentChange}
                  modules={modules}
                  formats={formats}
                  placeholder="Nội dung bài viết..."
                  style={{ height: '250px', marginBottom: '40px' }}
                />
                
                {/* Preview uploaded images */}
                {post.images.length > 0 && (
                  <Box sx={{ mt: 3, mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Hình ảnh đã tải lên
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {post.images.map((image, index) => (
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
                            src={getMediaUrl(image.url)}
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
                {post.videos.length > 0 && (
                  <Box sx={{ mt: 3, mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Video đã tải lên
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {post.videos.map((video, index) => (
                        <Box 
                          key={index} 
                          sx={{ 
                            position: 'relative',
                            width: 200,
                            borderRadius: 2,
                            overflow: 'hidden',
                            backgroundColor: 'rgba(0, 0, 0, 0.03)',
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
                {post.attachments.length > 0 && (
                  <Box sx={{ mt: 3, mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Tệp đính kèm
                    </Typography>
                    <Stack spacing={1}>
                      {post.attachments.map((file, index) => (
                        <Box 
                          key={index} 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1,
                            borderRadius: 1,
                            backgroundColor: 'rgba(0, 0, 0, 0.03)',
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
                    borderColor: 'divider',
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
                    value={post.category || categories[0]}
                    onChange={handleInputChange}
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
            
            {/* Form actions */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: currentTab === 0 ? 'space-between' : 'flex-end' }}>
              {currentTab === 0 ? (
                <>
                  <Button
                    onClick={() => setCurrentTab(1)}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Chọn danh mục
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={saving || !post.title || !post.content || uploadingMedia}
                    sx={{ minWidth: 120 }}
                  >
                    {saving ? <CircularProgress size={24} /> : 'Lưu thay đổi'}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setCurrentTab(0)}
                    sx={{ textTransform: 'none', borderRadius: 2, mr: 2 }}
                  >
                    Quay lại
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={saving || !post.title || !post.content || uploadingMedia}
                    sx={{ minWidth: 120 }}
                  >
                    {saving ? <CircularProgress size={24} /> : 'Lưu thay đổi'}
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Container>
  );
};

export default EditPost;