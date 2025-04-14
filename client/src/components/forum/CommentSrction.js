import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  IconButton
} from '@mui/material';
import { Reply, MoreVert } from '@mui/icons-material';
import moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');

const CommentSection = ({ postId, comments = [], onCommentAdd }) => {
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const comment = {
        _id: Date.now().toString(),
        content: newComment,
        createdAt: new Date().toISOString(),
        author: {
          username: 'nguyendu2k3',
          name: 'Nguyễn Du',
        }
      };
      
      await onCommentAdd(comment);
      setNewComment('');
    } catch (error) {
      console.error('Không thể thêm bình luận:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Bình luận ({comments.length})
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="Viết bình luận của bạn..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={submitting}
          sx={{ mb: 1 }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={submitting || !newComment.trim()}
        >
          Đăng bình luận
        </Button>
      </Box>

      <List>
        {comments.map((comment, index) => (
          <React.Fragment key={comment._id}>
            <ListItem 
              alignItems="flex-start"
              secondaryAction={
                <IconButton edge="end" aria-label="more">
                  <MoreVert />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar>
                  {comment.author.name.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography component="span" variant="subtitle2">
                      {comment.author.name}
                    </Typography>
                    <Typography component="span" variant="caption" color="text.secondary">
                      @{comment.author.username}
                    </Typography>
                    <Typography component="span" variant="caption" color="text.secondary">
                      • {moment(comment.createdAt).fromNow()}
                    </Typography>
                  </Box>
                }
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                      sx={{ display: 'block', my: 1 }}
                    >
                      {comment.content}
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<Reply />}
                      sx={{ mt: 1 }}
                    >
                      Trả lời
                    </Button>
                  </>
                }
              />
            </ListItem>
            {index < comments.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default CommentSection;