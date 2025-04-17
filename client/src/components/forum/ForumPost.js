import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  Button,
  IconButton,
  Box,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Stack,
  useTheme,
  Collapse,
  Grid,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  ThumbUp, 
  ThumbUpOutlined,
  Comment, 
  Share, 
  MoreVert,
  Bookmark,
  BookmarkBorder,
  Flag,
  Link,
  Edit,
  Delete,
  VisibilityOff,
  PersonAdd,
  StarOutline,
  Notifications,
  NotificationsOff,
  RemoveRedEye,
  ArrowForward
} from '@mui/icons-material';
import moment from 'moment';
import 'moment/locale/vi';
import { getAvatarUrl, getMediaUrl } from '../../utils/api';
import CommentSection from './CommentSection';

moment.locale('vi');

const ForumPost = ({ post, onViewDetails, onLikePost, onDeletePost, currentUser }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(post.userLiked || false);
  const [bookmarked, setBookmarked] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    setLiked(post.userLiked || false);
  }, [post.userLiked]);

  // Debug: Kiểm tra thông tin post và images
  console.log('Post data:', post);
  if (post.images && post.images.length > 0) {
    post.images.forEach((image, index) => {
      console.log(`Image ${index} url:`, image.url);
      const fullUrl = getMediaUrl(image.url);
      console.log(`Image ${index} full url:`, fullUrl);
    });
  }

  const isAuthor = currentUser && post.author && currentUser.id === post.author.id;
  const isOfficial = post.isOfficial || false;
  const isPinned = post.isPinned || false;

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    if (!liked) {
      setLiked(true);
      if (onLikePost) onLikePost(post._id);
    }
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
  };

  const handleCommentToggle = (e) => {
    e.stopPropagation();
    setShowComments(!showComments);
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/forum/post/${post._id}`);
    setSnackbarMessage('Post URL copied to clipboard!');
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Format thời gian hiển thị thân thiện
  const formatTimeAgo = (dateString) => {
    const date = moment(dateString);
    const now = moment();
    const diffHours = now.diff(date, 'hours');
    
    if (diffHours < 24) {
      return date.fromNow(); // "vài giây trước", "5 phút trước", "2 giờ trước"
    } else if (diffHours < 48) {
      return 'Hôm qua lúc ' + date.format('HH:mm');
    } else if (now.diff(date, 'days') < 7) {
      return date.format('dddd [lúc] HH:mm'); // "Thứ hai lúc 15:30"
    } else {
      return date.format('DD/MM/YYYY [lúc] HH:mm'); // "15/04/2025 lúc 15:30"
    }
  };

  const truncateText = (text, maxLength = 250) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Xử lý HTML từ quill editor nếu có
  const stripHtml = (html) => {
    if (!html) return '';
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || '';
    } catch (error) {
      console.error('Error parsing HTML content:', error);
      return html.replace(/<[^>]*>?/gm, ''); // Fallback to regex for stripping HTML tags
    }
  };

  // Trích xuất thông tin ảnh đầu tiên để hiển thị lớn nếu có
  const mainImage = post.images && post.images.length > 0 ? post.images[0] : null;
  const additionalImages = post.images && post.images.length > 1 ? post.images.slice(1, 4) : [];
  const hasMoreImages = post.images && post.images.length > 4;
  
  // Xác định chế độ hiển thị post (bố cục khác nhau tùy theo nội dung)
  const hasImages = post.images && post.images.length > 0;
  const hasContent = post.content && stripHtml(post.content).trim().length > 0;
  const isFeatured = isOfficial || isPinned;

  // Chọn bố cục hiển thị phù hợp
  const layout = isFeatured ? 'featured' : hasImages ? 'media' : 'text';
  
  // Make sure likes is a number for display
  const likesCount = post.likes && typeof post.likes === 'object' ? post.likes.count : (post.likes || 0);
  
  return (
    <Card 
      elevation={0} 
      component={Paper}
      onClick={() => onViewDetails(post._id)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      sx={{ 
        mb: 3, 
        borderRadius: 3,
        overflow: 'visible',
        borderWidth: 1,
        borderColor: isFeatured 
          ? (isOfficial ? theme.palette.primary.main : theme.palette.warning.main)
          : theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
        borderStyle: 'solid',
        backgroundColor: isFeatured
          ? (theme.palette.mode === 'dark' 
              ? (isOfficial ? 'rgba(25, 118, 210, 0.08)' : 'rgba(255, 152, 0, 0.05)') 
              : (isOfficial ? 'rgba(25, 118, 210, 0.04)' : 'rgba(255, 152, 0, 0.05)'))
          : theme.palette.background.paper,
        transition: 'all 0.3s ease',
        transform: hovering ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovering 
          ? (theme.palette.mode === 'dark' ? '0 8px 16px rgba(0,0,0,0.3)' : '0 8px 16px rgba(0,0,0,0.1)')
          : 'none',
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      {/* Badge for official or pinned posts */}
      {isOfficial && (
        <Chip
          label="Chính thức"
          size="small"
          color="primary"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 2,
            height: 24,
            fontWeight: 'medium',
            border: '1px solid',
            borderColor: theme.palette.primary.main,
          }}
        />
      )}
      
      {isPinned && (
        <Chip
          icon={<StarOutline sx={{ fontSize: '1rem !important' }} />}
          label="Ghim"
          size="small"
          color="warning"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 2,
            height: 24,
            fontWeight: 'medium',
            border: '1px solid',
            borderColor: theme.palette.warning.main,
          }}
        />
      )}

      <CardHeader
        avatar={
          <Avatar 
            src={getAvatarUrl(post.author?.avatar)} 
            sx={{ 
              width: 48, 
              height: 48,
              border: isOfficial ? `2px solid ${theme.palette.primary.main}` : 'none'
            }}
          >
            {post.author?.name?.charAt(0) || "U"}
          </Avatar>
        }
        title={
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" fontWeight="medium" sx={{ lineHeight: 1.3 }}>
              {post.author?.name || "Người dùng ẩn danh"}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {formatTimeAgo(post.createdAt)}
              </Typography>
              <Chip
                label={post.category}
                size="small"
                sx={{ 
                  height: 20, 
                  fontSize: '0.7rem',
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'
                }}
              />
            </Box>
          </Box>
        }
        action={
          <>
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ 
                color: theme.palette.text.secondary,
              }}
            >
              <MoreVert fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={(e) => e.stopPropagation()}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 2,
                  overflow: 'visible',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0px 5px 15px rgba(0, 0, 0, 0.5)'
                    : '0px 5px 15px rgba(0, 0, 0, 0.15)',
                  '& .MuiList-root': {
                    padding: '8px',
                  },
                  '&::before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: theme.palette.background.paper,
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleBookmarkClick}>
                <ListItemIcon>
                  {bookmarked ? <Bookmark fontSize="small" /> : <BookmarkBorder fontSize="small" />}
                </ListItemIcon>
                <ListItemText>
                  {bookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
                </ListItemText>
              </MenuItem>
              
              <MenuItem onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(`${window.location.origin}/forum/post/${post._id}`);
                handleMenuClose();
              }}>
                <ListItemIcon>
                  <Link fontSize="small" />
                </ListItemIcon>
                <ListItemText>Sao chép liên kết</ListItemText>
              </MenuItem>

              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  {post.following ? <NotificationsOff fontSize="small" /> : <Notifications fontSize="small" />}
                </ListItemIcon>
                <ListItemText>
                  {post.following ? 'Tắt thông báo' : 'Bật thông báo'}
                </ListItemText>
              </MenuItem>

              {isAuthor && (
                <>
                  <Divider />
                  <MenuItem onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/forum/edit/${post._id}`;
                    handleMenuClose();
                  }}>
                    <ListItemIcon>
                      <Edit fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Chỉnh sửa bài viết</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={(e) => {
                    e.stopPropagation();
                    if (onDeletePost) onDeletePost(post._id);
                    handleMenuClose();
                  }} sx={{ color: theme.palette.error.main }}>
                    <ListItemIcon>
                      <Delete fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Xóa bài viết</ListItemText>
                  </MenuItem>
                </>
              )}

              {!isAuthor && (
                <>
                  <Divider />
                  <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon>
                      <VisibilityOff fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Ẩn bài viết</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon>
                      <PersonAdd fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Theo dõi {post.author?.name}</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleMenuClose} sx={{ color: theme.palette.warning.main }}>
                    <ListItemIcon>
                      <Flag fontSize="small" color="warning" />
                    </ListItemIcon>
                    <ListItemText>Báo cáo bài viết</ListItemText>
                  </MenuItem>
                </>
              )}
            </Menu>
          </>
        }
        sx={{ px: 3, pt: 2, pb: 0.5, alignItems: 'flex-start' }}
      />

      <CardContent sx={{ px: 3, py: 1 }}>
        {/* Tiêu đề bài post */}
        <Typography variant="h6" fontWeight="600" gutterBottom sx={{ 
          fontSize: '1.15rem',
          color: isFeatured 
            ? (isOfficial 
              ? (theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main) 
              : (theme.palette.mode === 'dark' ? theme.palette.warning.light : theme.palette.warning.main))
            : (theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main)
        }}>
          {post.title}
        </Typography>
        
        {/* Nội dung rút gọn */}
        {(hasContent || layout === 'text') && (
          <Typography 
            variant="body2" 
            color="text.primary"
            sx={{ 
              mb: 2, 
              whiteSpace: 'pre-line',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '0.95rem',
              lineHeight: 1.5
            }}
          >
            {stripHtml(post.content) ? stripHtml(truncateText(post.content)) : ''}
          </Typography>
        )}

        {/* Hiển thị ảnh - thiết kế giống HoYoLAB */}
        {hasImages && (
          <Box sx={{ mb: 2, mt: hasContent ? 2 : 0 }}>
            <Grid container spacing={1}>
              {/* Ảnh chính - hiển thị lớn hơn */}
              {mainImage && (
                <Grid item xs={12} sm={post.images.length > 1 ? 6 : 12}>
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: '56.25%', // 16:9 aspect ratio
                      width: '100%',
                      height: 0,
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      component="img"
                      src={mainImage?.url ? `http://localhost:5000/uploads/images/${mainImage.url.split('/').pop()}` : ''}
                      alt={`Hình ảnh 1`}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        ...(hovering && { transform: 'scale(1.05)' }),
                      }}
                      onError={(e) => {
                        console.error("Lỗi tải ảnh:", e);
                        console.error("URL ảnh:", mainImage?.url);
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300?text=Hình+ảnh+không+tải+được';
                      }}
                    />
                  </Box>
                </Grid>
              )}
              
              {/* Các ảnh nhỏ hơn - hiển thị dạng lưới */}
              {additionalImages.length > 0 && (
                <Grid item xs={12} sm={6}>
                  <Grid container spacing={1}>
                    {additionalImages.map((image, index) => (
                      <Grid item xs={additionalImages.length === 1 ? 12 : 6} key={index}>
                        <Box
                          sx={{
                            position: 'relative',
                            paddingTop: '100%', // 1:1 aspect ratio
                            width: '100%',
                            height: 0,
                            borderRadius: 2,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            component="img"
                            src={image.url ? `http://localhost:5000/${image.url.replace(/^\/+/, '')}` : ''}
                            alt={`Hình ảnh ${index + 2}`}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.3s ease',
                              ...(hovering && { transform: 'scale(1.05)' }),
                            }}
                            onError={(e) => {
                              console.error("Lỗi tải ảnh phụ:", e);
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/150?text=Ảnh+lỗi';
                            }}
                          />
                          
                          {/* Hiển thị số lượng ảnh còn lại */}
                          {index === 2 && hasMoreImages && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 2
                              }}
                            >
                              <Typography variant="h6">+{post.images.length - 4}</Typography>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
            {post.tags.map((tag, index) => (
              <Chip
                key={index}
                label={`#${tag}`}
                size="small"
                sx={{ 
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'primary.main',
                  height: 22,
                  fontSize: '0.8rem',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)'
                  },
                  px: 0,
                  py: 0
                }}
              />
            ))}
          </Stack>
        )}

        {/* Đọc tiếp link */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <Button 
            endIcon={<ArrowForward />}
            sx={{ 
              textTransform: 'none',
              fontWeight: 'medium',
              fontSize: '0.85rem',
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline'
              }
            }}
          >
            Đọc tiếp
          </Button>
        </Box>

        {/* Engagement Stats */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            pt: 1,
            mt: 1,
            borderTop: `1px solid ${theme.palette.divider}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {likesCount > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ThumbUp fontSize="small" color="primary" />
                <Typography variant="body2" color="text.secondary">
                  {likesCount}
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {post.views > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <RemoveRedEye fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {post.views || 0}
                </Typography>
              </Box>
            )}
            {(post.comments && post.comments.length > 0) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Comment fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {post.comments.length}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>

      <CardActions 
        sx={{ 
          px: 3, 
          pb: 1.5,
          pt: 0.5,
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0, 0, 0, 0.01)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          fullWidth
          startIcon={liked ? <ThumbUp color="primary" /> : <ThumbUpOutlined />}
          onClick={handleLikeClick}
          sx={{ 
            textTransform: 'none',
            color: liked ? 'primary.main' : 'text.secondary',
            borderRadius: 2,
            fontSize: '0.85rem',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
            }
          }}
        >
          Thích{likesCount > 0 ? ` (${likesCount})` : ''}
        </Button>
        <Button
          fullWidth
          startIcon={<Comment />}
          onClick={handleCommentToggle}
          sx={{ 
            textTransform: 'none', 
            color: 'text.secondary', 
            borderRadius: 2, 
            fontSize: '0.85rem',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
            }
          }}
        >
          Bình luận
        </Button>
        <Button
          fullWidth
          startIcon={<Share />}
          onClick={handleShareClick}
          sx={{ 
            textTransform: 'none', 
            color: 'text.secondary', 
            borderRadius: 2, 
            fontSize: '0.85rem',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
            }
          }}
        >
          Chia sẻ
        </Button>
      </CardActions>

      {/* Comment Section */}
      <Collapse in={showComments} onClick={(e) => e.stopPropagation()}>
        <Divider />
        <Box sx={{ px: 3, py: 2, backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.01)' }}>
          {/* Add debugging to visualize comment data */}
          {console.log("Forum comments data:", post.comments)}
          
          <CommentSection 
            postId={post._id} 
            comments={(post.comments || []).map(comment => {
              // Ensure avatar data is properly processed for each comment
              if (comment.author && !comment.author.avatar && comment.author._id) {
                // If author exists but avatar is missing, add a default avatar based on author ID
                return {
                  ...comment,
                  author: {
                    ...comment.author,
                    avatar: comment.author._id.toString() // Use the ID as the avatar path
                  }
                };
              }
              return comment;
            })} 
          />
        </Box>
      </Collapse>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default ForumPost;