import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Avatar,
  IconButton,
  Divider,
  Chip,
  Stack,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  Link as MuiLink,
  Breadcrumbs,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from '@mui/material';
import {
  ThumbUp,
  ThumbUpOutlined,
  Comment,
  Share,
  MoreVert,
  ArrowBack,
  BookmarkBorder,
  Bookmark,
  Flag,
  Link as LinkIcon,
  Edit,
  Delete,
  FormatQuote,
  NavigateNext,
  Home,
  RemoveRedEye,
} from '@mui/icons-material';
import { Link, useParams, useNavigate } from 'react-router-dom';
import CommentSection from '../components/forum/CommentSection';
import { useAuth } from '../context/AuthContext';
import { forumAPI, getAvatarUrl, getMediaUrl } from '../utils/api';
import moment from 'moment';
import 'moment/locale/vi';
import DOMPurify from 'dompurify';

moment.locale('vi');

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const commentInputRef = useRef(null);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const [viewCount, setViewCount] = useState(0);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchPostDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await forumAPI.getPostById(postId);
      
      if (response.data && response.data.success) {
        const postData = response.data.data;
        if (!postData) {
          setError('Không tìm thấy bài viết hoặc bài viết đã bị xóa.');
          return;
        }
        
        // Đảm bảo dữ liệu likes là số
        const likesCount = postData.likes && typeof postData.likes === 'object' 
          ? postData.likes.count
          : (typeof postData.likes === 'number' ? postData.likes : 0);
        
        // Cập nhật postData với likesCount chính xác
        const formattedPost = {
          ...postData,
          likes: likesCount
        };
        
        setPost(formattedPost);
        setLiked(postData.userLiked || false);
        setBookmarked(postData.userBookmarked || false);
        setComments(postData.comments || []);
        setViewCount(postData.views || 0);
      } else {
        setError('Không thể tải chi tiết bài viết. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết bài viết:', error);
      console.error('Chi tiết lỗi:', error.response?.data);
      if (error.response) {
        if (error.response.status === 404) {
          setError('Không tìm thấy bài viết hoặc bài viết đã bị xóa.');
        } else {
          setError(`Lỗi máy chủ: ${error.response.data?.message || 'Không thể tải chi tiết bài viết'}`);
        }
      } else if (error.request) {
        setError('Máy chủ không phản hồi. Vui lòng thử lại sau.');
      } else {
        setError('Không thể tải chi tiết bài viết. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPostDetail();
    
    const incrementViewCount = async () => {
      try {
        await forumAPI.incrementPostView(postId);
      } catch (error) {
        console.error('Lỗi khi tăng lượt xem:', error);
      }
    };
    
    incrementViewCount();
  }, [postId, fetchPostDetail]);

  const handleLikePost = async () => {
    try {
      if (liked) {
        await forumAPI.unlikePost(postId);
        if (post.likes) {
          setPost({
            ...post,
            likes: Math.max(0, post.likes - 1)
          });
        }
      } else {
        await forumAPI.likePost(postId);
        setPost({
          ...post,
          likes: post.likes + 1
        });
      }
      setLiked(!liked);
    } catch (error) {
      console.error('Lỗi khi thích bài viết:', error);
    }
  };

  const handleBookmarkPost = async () => {
    try {
      const response = await forumAPI.bookmarkPost(postId);
      if (response.data && response.data.success) {
        setBookmarked(!bookmarked);
      }
    } catch (error) {
      console.error('Lỗi khi lưu bài viết:', error);
    }
  };

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleShareOpen = (event) => {
    setShareAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setSnackbar({
      open: true,
      message: 'URL copied to clipboard!',
      severity: 'success'
    });
    handleShareClose();
  };

  const handleScrollToComments = () => {
    commentInputRef.current?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      const inputElement = document.getElementById('comment-input');
      if (inputElement) {
        inputElement.focus();
      }
    }, 500);
  };

  const formatTimeAgo = (dateString) => {
    const date = moment(dateString);
    const now = moment();
    const diffHours = now.diff(date, 'hours');
    
    if (diffHours < 24) {
      return date.fromNow();
    } else if (diffHours < 48) {
      return 'Hôm qua lúc ' + date.format('HH:mm');
    } else if (now.diff(date, 'days') < 7) {
      return date.format('dddd [lúc] HH:mm');
    } else {
      return date.format('DD/MM/YYYY [lúc] HH:mm');
    }
  };

  const isAuthor = user && post && user.id === post.author?.id;

  const handleDeletePost = async () => {
    setDeleteLoading(true);
    try {
      const response = await forumAPI.deletePost(postId);
      if (response.data && response.data.success) {
        setSnackbar({
          open: true,
          message: 'Xóa bài viết thành công',
          severity: 'success'
        });
        setTimeout(() => navigate('/forum'), 1500);
      } else {
        setSnackbar({
          open: true,
          message: 'Không thể xóa bài viết',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Lỗi khi xóa bài viết:', error);
      setSnackbar({
        open: true,
        message: 'Lỗi khi xóa bài viết',
        severity: 'error'
      });
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', flexDirection: 'column' }}>
        <CircularProgress sx={{ mb: 2 }}/>
        <Typography variant="body2" color="text.secondary">
          Đang tải bài viết...
        </Typography>
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error || 'Không thể tải chi tiết bài viết'}
        </Alert>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 4 }}>
          <Typography variant="h6" gutterBottom>
            {error || 'Không tìm thấy bài viết'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            component={Link}
            to="/forum"
            sx={{ mt: 2 }}
          >
            Quay lại diễn đàn
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.mode === 'dark' ? '#1a1b1e' : '#f5f6f8',
        minHeight: '100vh',
        py: 3
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Breadcrumbs 
            separator={<NavigateNext fontSize="small" />} 
            aria-label="breadcrumb"
          >
            <MuiLink 
              component={Link} 
              to="/" 
              underline="hover" 
              color="inherit" 
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Home sx={{ mr: 0.5 }} fontSize="small" />
              Trang chủ
            </MuiLink>
            <MuiLink
              component={Link}
              to="/forum"
              underline="hover"
              color="inherit"
            >
              Diễn đàn
            </MuiLink>
            <Typography color="text.primary" noWrap sx={{ maxWidth: 150 }}>
              {post.title.substring(0, 20)}{post.title.length > 20 ? '...' : ''}
            </Typography>
          </Breadcrumbs>

          <Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBack />}
              component={Link}
              to="/forum"
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Quay lại diễn đàn
            </Button>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                backgroundColor: theme.palette.background.paper,
                mb: 3,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Box sx={{ p: 3, pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={getAvatarUrl(post.author?.avatar)}
                      sx={{ width: 48, height: 48 }}
                    >
                      {post.author?.name?.charAt(0) || "?"}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600">
                        {post.author?.name || "Người dùng ẩn danh"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatTimeAgo(post.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <IconButton
                      onClick={handleMenuOpen}
                      sx={{ 
                        color: theme.palette.text.secondary,
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography 
                  variant="h5" 
                  component="h1" 
                  gutterBottom 
                  sx={{ 
                    mt: 3, 
                    mb: 2, 
                    fontWeight: '700',
                    color: theme.palette.primary.main
                  }}
                >
                  {post.title}
                </Typography>

                {post.category && (
                  <Box sx={{ mt: 1, mb: 3, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Chip 
                      label={post.category} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ borderRadius: 1 }}
                    />
                    {post.tags && post.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={`#${tag}`}
                        size="small"
                        sx={{ 
                          color: theme.palette.primary.main,
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(25, 118, 210, 0.08)' 
                            : 'rgba(25, 118, 210, 0.08)',
                          borderRadius: 1
                        }}
                      />
                    ))}
                  </Box>
                )}
                
                <Box sx={{ mt: 4 }}>
                  <div
                    dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(post.content) 
                    }}
                    style={{
                      lineHeight: 1.8,
                      fontSize: '1.05rem',
                      whiteSpace: 'pre-line',
                      wordBreak: 'break-word'
                    }}
                  />
                </Box>
                
                {post.images && post.images.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Grid container spacing={2}>
                      {post.images.map((image, index) => (
                        <Grid item xs={12} sm={post.images.length > 1 ? 6 : 12} key={index}>
                          <Box
                            component="img"
                            src={getMediaUrl(image.url)}
                            alt={`Hình ảnh ${index + 1}`}
                            sx={{
                              width: '100%',
                              height: 'auto',
                              borderRadius: 3,
                              cursor: 'pointer',
                              maxHeight: 500,
                              objectFit: 'contain',
                              boxShadow: theme.palette.mode === 'dark' 
                                ? 'none' 
                                : '0 4px 12px rgba(0,0,0,0.05)'
                            }}
                            onClick={() => window.open(getMediaUrl(image.url), '_blank')}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 4,
                    pt: 2,
                    borderTop: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {post.likes > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box 
                          sx={{ 
                            bgcolor: 'primary.main', 
                            p: 0.5, 
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <ThumbUp sx={{ fontSize: 14, color: 'white' }} />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {post.likes}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <RemoveRedEye fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {viewCount}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {comments.length} bình luận
                    </Typography>
                  </Box>
                </Box>
                
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 1,
                    pt: 1,
                    pb: 1,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Button
                    startIcon={liked ? <ThumbUp color="primary" /> : <ThumbUpOutlined />}
                    onClick={handleLikePost}
                    sx={{ 
                      flex: 1, 
                      color: liked ? 'primary.main' : 'text.secondary',
                      textTransform: 'none',
                      borderRadius: 2,
                      py: 1
                    }}
                  >
                    Thích{post.likes > 0 ? ` (${post.likes})` : ''}
                  </Button>
                  <Button
                    startIcon={<Comment />}
                    onClick={handleScrollToComments}
                    sx={{ flex: 1, textTransform: 'none', color: 'text.secondary', borderRadius: 2, py: 1 }}
                  >
                    Bình luận
                  </Button>
                  <Button
                    startIcon={<Share />}
                    onClick={handleShareOpen}
                    sx={{ flex: 1, textTransform: 'none', color: 'text.secondary', borderRadius: 2, py: 1 }}
                  >
                    Chia sẻ
                  </Button>
                </Box>
              </Box>
            </Paper>
            
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                backgroundColor: theme.palette.background.paper,
                mb: 3,
                border: `1px solid ${theme.palette.divider}`
              }}
              ref={commentInputRef}
            >
              <CommentSection 
                postId={postId} 
                comments={comments} 
                onCommentAdded={(newComment) => {
                  console.log("Comment added:", newComment);
                  setComments(prevComments => [newComment, ...prevComments]);
                }}
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                position: { md: 'sticky' },
                top: { md: 80 },
              }}
            >
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  backgroundColor: theme.palette.background.paper,
                  mb: 3,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2, color: theme.palette.mode === 'dark' ? '#fff' : '#333' }}>
                  Thông tin tác giả
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Avatar
                    src={getAvatarUrl(post.author?.avatar)}
                    sx={{ width: 56, height: 56 }}
                  >
                    {post.author?.name?.charAt(0) || '?'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="600">
                      {post.author?.name || 'Người dùng ẩn danh'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {post.author?.role || 'Sinh viên'}
                    </Typography>
                  </Box>
                </Box>
                
                {post.author?.bio && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                    "{post.author.bio}"
                  </Typography>
                )}
                
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ 
                      borderRadius: 2, 
                      textTransform: 'none',
                      mb: 1.5,
                      py: 1
                    }}
                  >
                    Theo dõi
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    component={Link}
                    to={`/profile/${post.author?._id}`}
                    sx={{ 
                      borderRadius: 2, 
                      textTransform: 'none',
                      py: 1
                    }}
                  >
                    Xem hồ sơ
                  </Button>
                </Box>
              </Paper>
              
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  backgroundColor: theme.palette.background.paper,
                  mb: 3,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2, color: theme.palette.mode === 'dark' ? '#fff' : '#333' }}>
                  Bài viết liên quan
                </Typography>
                
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ textAlign: 'center', p: 3, backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Chưa có bài viết liên quan
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2, color: theme.palette.mode === 'dark' ? '#fff' : '#333' }}>
                  Thống kê bài viết
                </Typography>
                
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Lượt xem:</Typography>
                    <Typography variant="body2" fontWeight="medium">{viewCount}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Lượt thích:</Typography>
                    <Typography variant="body2" fontWeight="medium">{post.likes || 0}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Bình luận:</Typography>
                    <Typography variant="body2" fontWeight="medium">{comments.length}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Đã đăng:</Typography>
                    <Typography variant="body2" fontWeight="medium">{moment(post.createdAt).format('DD/MM/YYYY')}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
      
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 2,
          sx: {
            mt: 1.5,
            minWidth: 180,
            borderRadius: 2,
            boxShadow: theme.palette.mode === 'dark'
              ? '0px 5px 15px rgba(0, 0, 0, 0.5)'
              : '0px 5px 15px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <MenuItem onClick={() => {
          handleBookmarkPost();
          handleMenuClose();
        }}>
          <ListItemIcon>
            {bookmarked ? <Bookmark fontSize="small" /> : <BookmarkBorder fontSize="small" />}
          </ListItemIcon>
          {bookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
        </MenuItem>
        
        <MenuItem onClick={handleShareOpen}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          Chia sẻ
        </MenuItem>
        
        {isAuthor && (
          <>
            <Divider />
            <MenuItem component={Link} to={`/forum/edit/${postId}`}>
              <ListItemIcon>
                <Edit fontSize="small" />
              </ListItemIcon>
              Chỉnh sửa bài viết
            </MenuItem>
            <MenuItem 
              sx={{ color: theme.palette.error.main }}
              onClick={() => {
                setDeleteDialogOpen(true);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <Delete fontSize="small" color="error" />
              </ListItemIcon>
              Xóa bài viết
            </MenuItem>
          </>
        )}
        
        {!isAuthor && (
          <MenuItem sx={{ color: theme.palette.warning.main }}>
            <ListItemIcon>
              <Flag fontSize="small" color="warning" />
            </ListItemIcon>
            Báo cáo bài viết
          </MenuItem>
        )}
      </Menu>

      <Menu
        anchorEl={shareAnchorEl}
        open={Boolean(shareAnchorEl)}
        onClose={handleShareClose}
        PaperProps={{
          elevation: 2,
          sx: {
            mt: 1.5,
            minWidth: 180,
            borderRadius: 2,
            boxShadow: theme.palette.mode === 'dark'
              ? '0px 5px 15px rgba(0, 0, 0, 0.5)'
              : '0px 5px 15px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <MenuItem onClick={handleCopyLink}>
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          Sao chép liên kết
        </MenuItem>
        <MenuItem onClick={handleShareClose}>
          <ListItemIcon>
            <FormatQuote fontSize="small" />
          </ListItemIcon>
          Trích dẫn bài viết
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Xác nhận xóa bài viết</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Hủy
          </Button>
          <Button 
            onClick={handleDeletePost} 
            color="error" 
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
};

export default PostDetail;