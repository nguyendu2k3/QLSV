import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Box,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Chip,
  Stack,
  Card,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Divider
} from '@mui/material';
import {
  Add,
  Search,
  TrendingUp,
  NewReleases,
  ThumbUp,
  Comment,
  Share,
  MoreVert
} from '@mui/icons-material';
import CreatePost from '../components/forum/CreatePost';
import { useAuth } from '../context/AuthContext';

const categories = [
  'Tất cả',
  'Học tập',
  'Hoạt động sinh viên',
  'Thắc mắc & Hỗ trợ',
  'Chia sẻ kinh nghiệm',
  'Khác'
];

const Forum = () => {
  const { user } = useAuth();
  const [openCreate, setOpenCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('newest');
  const [posts, setPosts] = useState([
    {
      _id: '1',
      title: 'Hỏi về bài tập Java',
      content: 'Mình đang gặp vấn đề với bài tập Java, có ai giúp mình được không?',
      category: 'Học tập',
      createdAt: '2025-03-19T02:54:48Z',
      author: {
        username: 'nguyendu2k3',
        name: 'Nguyễn Du',
        avatar: null
      },
      likes: 5,
      comments: 3,
      tags: ['java', 'học tập', 'bài tập']
    },
    {
      _id: '2',
      title: 'Thông báo về hoạt động ngoại khóa',
      content: 'CLB Tin học tổ chức buổi workshop về AI vào ngày 25/03/2025',
      category: 'Hoạt động sinh viên',
      createdAt: '2025-03-19T02:54:48Z',
      author: {
        username: 'admin',
        name: 'Admin',
        avatar: null
      },
      likes: 10,
      comments: 5,
      tags: ['workshop', 'AI', 'ngoại khóa']
    }
  ]);

  const handleCreatePost = (newPost) => {
    setPosts([
      {
        ...newPost,
        _id: Date.now().toString(),
        likes: 0,
        comments: 0,
        author: {
          username: user.username,
          name: user.name,
          avatar: user.avatar
        },
        createdAt: new Date().toISOString(),
        tags: newPost.category.toLowerCase().split(' ')
      },
      ...posts
    ]);
    setOpenCreate(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterAndSortPosts = () => {
    let filteredPosts = [...posts];

    if (selectedCategory !== 'Tất cả') {
      filteredPosts = filteredPosts.filter(post => post.category === selectedCategory);
    }

    if (searchTerm) {
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'trending':
        filteredPosts.sort((a, b) => b.likes - a.likes);
        break;
      case 'newest':
        filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    return filteredPosts;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Diễn đàn
        </Typography>
        <Typography color="text.secondary">
          Chia sẻ và thảo luận với cộng đồng
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenCreate(true)}
              sx={{ borderRadius: 2 }}
            >
              Tạo bài viết
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Danh mục"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sắp xếp theo"
                >
                  <MenuItem value="newest">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <NewReleases sx={{ mr: 1 }} />
                      Mới nhất
                    </Box>
                  </MenuItem>
                  <MenuItem value="trending">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUp sx={{ mr: 1 }} />
                      Thịnh hành
                    </Box>
                  </MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {filterAndSortPosts().map((post) => (
          <Grid item xs={12} key={post._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar src={post.author.avatar}>
                    {post.author.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="subtitle1">
                      {post.author.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(post.createdAt)}
                    </Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton>
                    <MoreVert />
                  </IconButton>
                </Box>

                <Typography variant="h6" gutterBottom>
                  {post.title}
                </Typography>
                <Typography variant="body1" paragraph>
                  {post.content}
                </Typography>

                <Stack direction="row" spacing={1} mb={2}>
                  {post.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </CardContent>

              <Divider />

              <CardActions>
                <Button
                  size="small"
                  startIcon={<ThumbUp />}
                  onClick={() => {}}
                >
                  {post.likes}
                </Button>
                <Button
                  size="small"
                  startIcon={<Comment />}
                  onClick={() => {}}
                >
                  {post.comments}
                </Button>
                <Button
                  size="small"
                  startIcon={<Share />}
                  onClick={() => {}}
                >
                  Chia sẻ
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <CreatePost
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={handleCreatePost}
        categories={categories.filter(cat => cat !== 'Tất cả')}
      />
    </Container>
  );
};

export default Forum;