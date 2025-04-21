import React, { useState, useRef, useEffect } from 'react';
import {
  Avatar,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
  useTheme,
  InputAdornment,
  CircularProgress,
  LinearProgress,
  Divider,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Send,
  ThumbUp,
  ThumbUpOutlined,
  MoreVert,
  Delete,
  Flag,
  InsertPhoto,
  Storage
} from '@mui/icons-material';
import { forumAPI, getAvatarUrl, getBinaryImageUrl } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');

const CommentSection = ({ postId, comments = [], onCommentAdded }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState(comments || []);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [hoveredComment, setHoveredComment] = useState(null);
  const [commentImage, setCommentImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [storeInDB, setStoreInDB] = useState(false);

  const commentInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    console.log("Comment data received:", comments);
    setLocalComments(comments || []);
  }, [comments]);

  const handleMenuOpen = (event, commentId) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    setSelectedComment(commentId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      alert('Chỉ chấp nhận file ảnh định dạng JPEG, PNG, GIF hoặc WebP');
      return;
    }

    setCommentImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const removeImage = () => {
    setCommentImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview('');
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() && !commentImage) return;

    setLoadingSubmit(true);

    try {
      const formData = new FormData();
      formData.append('content', commentText);
      formData.append('postId', postId);

      if (commentImage) {
        formData.append('commentImage', commentImage);
      }

      const response = storeInDB 
        ? await forumAPI.addCommentWithImageInDB(formData, (progress) => {
            setUploadProgress(progress);
          })
        : await forumAPI.addComment(formData, (progress) => {
            setUploadProgress(progress);
          });

      if (response.data && response.data.success) {
        const newComment = response.data.data;
        setLocalComments([newComment, ...localComments]);
        setCommentText('');
        removeImage();

        if (onCommentAdded) onCommentAdded(newComment);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setLoadingSubmit(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteComment = async () => {
    if (!selectedComment) return;

    try {
      await forumAPI.deleteComment(selectedComment);

      const removeCommentFromList = (list) =>
        list.filter(comment =>
          comment._id !== selectedComment).map(comment =>
            comment.replies ? { ...comment, replies: removeCommentFromList(comment.replies) } : comment
          );

      setLocalComments(removeCommentFromList(localComments));
      handleMenuClose();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await forumAPI.likeComment(commentId);

      const updateLikeInList = (list) =>
        list.map(comment => {
          if (comment._id === commentId) {
            const userLiked = !comment.userLiked;
            const likes = userLiked ? (comment.likes || 0) + 1 : (comment.likes || 1) - 1;
            return { ...comment, userLiked, likes };
          }
          return comment.replies ?
            { ...comment, replies: updateLikeInList(comment.replies) } :
            comment;
        });

      setLocalComments(updateLikeInList(localComments));
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = moment(dateString);
    return date.fromNow();
  };

  const getCommentImageUrl = (comment) => {
    if (comment.imageData && comment.imageData.data) {
      return URL.createObjectURL(
        new Blob(
          [new Uint8Array(comment.imageData.data.data || [])], 
          { type: comment.imageData.contentType }
        )
      );
    }
    
    if (comment.image) {
      if (comment.image.startsWith('http')) {
        return comment.image;
      }

      const filename = comment.image.split('/').pop();
      return `http://localhost:5000/uploads/comments/${filename}`;
    }
    
    return null;
  };

  const renderComment = (comment) => {
    const isHovered = hoveredComment === comment._id;
    console.log("Comment author data:", comment.author);
    console.log("Avatar path:", comment.author?.avatar);
    
    const avatarUrl = comment.author?.avatar ? getAvatarUrl(comment.author.avatar) : null;
    console.log("Processed avatar URL:", avatarUrl);
    
    const commentImageUrl = getCommentImageUrl(comment);
    
    return (
      <Box
        key={comment._id}
        sx={{ mt: 2, position: 'relative' }}
        onMouseEnter={() => setHoveredComment(comment._id)}
        onMouseLeave={() => setHoveredComment(null)}
      >
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Avatar
            src={avatarUrl}
            sx={{ width: 36, height: 36 }}
            alt={comment.author?.name || "User"}
          >
            {comment.author?.name?.charAt(0) || "?"}
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 3,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                position: 'relative',
                transition: 'all 0.2s',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: isHovered ? theme.palette.divider : 'transparent'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="subtitle2" fontWeight="medium" color="text.primary">
                  {comment.author?.name || user?.name || "Người dùng"}
                </Typography>

                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, comment._id)}
                  sx={{
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.2s',
                    p: 0.5,
                  }}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
              </Box>

              <Typography variant="body2" sx={{ mb: 1, wordBreak: 'break-word' }}>
                {comment.content}
              </Typography>

              {commentImageUrl && (
                <Box
                  sx={{
                    mt: 1,
                    mb: 2,
                    maxWidth: '100%',
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <Box
                    component="img"
                    src={commentImageUrl}
                    alt="Comment image"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 300,
                      borderRadius: 2,
                      cursor: 'pointer'
                    }}
                    onClick={() => window.open(commentImageUrl, '_blank')}
                    onError={(e) => {
                      console.error("Lỗi tải ảnh bình luận");
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300?text=Không+tải+được+ảnh';
                    }}
                  />
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {formatTimeAgo(comment.createdAt)}
                </Typography>

                <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    size="small"
                    onClick={() => handleLikeComment(comment._id)}
                    sx={{
                      p: 0.3,
                      color: comment.userLiked ? 'primary.main' : 'text.secondary'
                    }}
                  >
                    {comment.userLiked ?
                      <ThumbUp fontSize="inherit" /> :
                      <ThumbUpOutlined fontSize="inherit" />
                    }
                  </IconButton>

                  {(comment.likes > 0) && (
                    <Typography variant="caption" color="text.secondary">
                      {comment.likes}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    );
  };

  const handleStoreInDBChange = (event) => {
    setStoreInDB(event.target.checked);
  };

  return (
    <Box sx={{ px: 3, py: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Bình luận ({localComments.length})
      </Typography>
      
      <Box
        component="form"
        onSubmit={handleSubmitComment}
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          alignItems: 'flex-start'
        }}
      >
        <Avatar
          src={getAvatarUrl(user?.avatar)}
          sx={{ width: 40, height: 40 }}
        >
          {user?.name?.charAt(0) || '?'}
        </Avatar>

        <Box sx={{ flexGrow: 1 }}>
          <TextField
            id="comment-input"
            inputRef={commentInputRef}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Viết bình luận..."
            fullWidth
            multiline
            minRows={1}
            maxRows={4}
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    color="primary"
                  >
                    <InsertPhoto fontSize="small" />
                  </IconButton>
                  <IconButton 
                    type="submit" 
                    disabled={loadingSubmit || (!commentText.trim() && !commentImage)}
                  >
                    <Send fontSize="small" color={commentText.trim() || commentImage ? "primary" : "disabled"} />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                py: 1,
                px: 2,
                borderRadius: '20px',
              }
            }}
          />

          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={storeInDB}
                  onChange={handleStoreInDBChange}
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Storage fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="caption">Lưu ảnh trực tiếp vào database</Typography>
                </Box>
              }
            />
          </Box>

          {imagePreview && (
            <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
              <Box
                component="img"
                src={imagePreview}
                alt="Image preview"
                sx={{
                  maxWidth: 200,
                  maxHeight: 150,
                  borderRadius: 2
                }}
              />
              <IconButton
                size="small"
                onClick={removeImage}
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  p: 0.5,
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' }
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          )}

          {loadingSubmit && uploadProgress > 0 && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">{`${Math.round(uploadProgress)}%`}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mt: 2 }}>
        {localComments.length > 0 ? (
          localComments.map(comment => renderComment(comment))
        ) : (
          <Box sx={{ textAlign: 'center', py: 3, backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
            </Typography>
          </Box>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 2,
          sx: {
            overflow: 'visible',
            mt: 1.5,
            borderRadius: 2,
            minWidth: 180
          }
        }}
      >
        {localComments.some(c => c._id === selectedComment && c.author?.id === user?.id) && (
          <MenuItem onClick={handleDeleteComment} sx={{ color: theme.palette.error.main }}>
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Xóa</ListItemText>
          </MenuItem>
        )}

        {!localComments.some(c => c._id === selectedComment && c.author?.id === user?.id) && (
          <MenuItem onClick={handleMenuClose} sx={{ color: theme.palette.warning.main }}>
            <ListItemIcon>
              <Flag fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText>Báo cáo</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default CommentSection;