import React from 'react';
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
  Badge
} from '@mui/material';
import { Comment, Favorite, Share, BookmarkBorder } from '@mui/icons-material';
import moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');

const ForumPost = ({ post, onViewDetails }) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        avatar={
          <Avatar src={post.author.profilePicture}>
            {post.author.name.charAt(0)}
          </Avatar>
        }
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" component="span">
              {post.author.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              @{post.author.username}
            </Typography>
          </Box>
        }
        subheader={moment(post.createdAt).fromNow()}
        action={
          <Chip
            label={post.category}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ ml: 1 }}
          />
        }
      />
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {post.title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {post.content.length > 200
            ? `${post.content.substring(0, 200)}...`
            : post.content}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="thích">
          <Badge badgeContent={post.likes} color="primary">
            <Favorite />
          </Badge>
        </IconButton>
        <IconButton aria-label="bình luận">
          <Badge badgeContent={post.comments?.length || 0} color="primary">
            <Comment />
          </Badge>
        </IconButton>
        <IconButton aria-label="chia sẻ">
          <Share />
        </IconButton>
        <IconButton aria-label="lưu">
          <BookmarkBorder />
        </IconButton>
        <Box sx={{ flexGrow: 1 }} />
        <Button 
          size="small" 
          color="primary"
          onClick={() => onViewDetails(post._id)}
        >
          Xem chi tiết
        </Button>
      </CardActions>
    </Card>
  );
};

export default ForumPost;