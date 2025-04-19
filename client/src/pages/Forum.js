import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Box,
  InputAdornment,
  CircularProgress,
  Avatar,
  IconButton,
  Divider,
  Alert,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Add,
  Search,
  Sort,
  Close,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CreatePost from '../components/forum/CreatePost';
import ForumPost from '../components/forum/ForumPost';
import { useAuth } from '../context/AuthContext';
import { forumAPI, getAvatarUrl } from '../utils/api';

// Các danh mục diễn đàn được mở rộng
const categories = [
  'Tất cả',
  'Học tập',
  'Hoạt động sinh viên',
  'Thắc mắc & Hỗ trợ',
  'Chia sẻ kinh nghiệm',
  'Sự kiện',
  'Tài liệu',
  'Đời sống',
  'Khác'
];

const Forum = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [openCreate, setOpenCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('newest');
  const [posts, setPosts] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Lấy danh sách bài viết khi component mount hoặc danh mục thay đổi
  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await forumAPI.getPosts();
      console.log('Server response:', response);
      
      if (response.data) {
        // Kiểm tra xem dữ liệu bài viết nằm ở đâu trong response
        let allPosts;
        if (Array.isArray(response.data)) {
          // Nếu response.data là array trực tiếp
          allPosts = response.data;
          console.log('Posts data is direct array with', allPosts.length, 'items');
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Nếu response.data.data là array
          allPosts = response.data.data;
          console.log('Posts data is in data property with', allPosts.length, 'items');
        } else if (response.data.success && Array.isArray(response.data.data)) {
          // Nếu response.data có cấu trúc {success: true, data: [...]}
          allPosts = response.data.data;
          console.log('Posts data is in success structure with', allPosts.length, 'items');
        } else {
          // Nếu không tìm thấy mảng bài viết
          allPosts = [];
          console.error('Could not find posts array in response:', response.data);
        }
        
        // Log thông tin chi tiết về bài viết để debug
        if (allPosts.length > 0) {
          console.log('First post example:', allPosts[0]);
        }
        
        // Xử lý trường hợp likes là object
        const processedPosts = allPosts.map(post => {
          // Nếu likes là object, lấy count
          if (post.likes && typeof post.likes === 'object' && post.likes.count !== undefined) {
            return {
              ...post,
              likes: post.likes.count
            };
          }
          return post;
        });
        
        setPosts(processedPosts);
      } else {
        console.error('Response data is empty or undefined');
        setPosts([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bài viết:', error);
      console.error('Chi tiết lỗi:', error.response?.data || error.message);
      setError('Không thể tải bài viết. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (newPost) => {
    setError('');
    try {
      const postWithAuthor = {
        ...newPost,
        authorId: user?.id,
        images: Array.isArray(newPost.images) ? newPost.images : [],
        videos: Array.isArray(newPost.videos) ? newPost.videos : [],
        attachments: Array.isArray(newPost.attachments) ? newPost.attachments : []
      };
      
      console.log('Chuẩn bị tạo bài viết mới:', postWithAuthor);
      
      // Gọi API để lưu bài viết mới vào cơ sở dữ liệu
      const response = await forumAPI.createPost(postWithAuthor);
      if (response.data && response.data.success) {
        // Thêm bài viết mới vào danh sách hiện tại
        setPosts([response.data.data, ...posts]);
        setOpenCreate(false);
      }
    } catch (error) {
      console.error('Lỗi khi tạo bài viết:', error);
      const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        'Không thể tạo bài viết. Vui lòng thử lại sau.';
      setError(`Lỗi: ${errorMessage}`);
    }
  };

  const handleViewPostDetail = (postId) => {
    try {
      console.log('Đang chuyển hướng đến bài viết có ID:', postId);
      // Đánh dấu xem bài viết
      forumAPI.incrementPostView(postId)
        .then(() => {
          console.log('Đã tăng lượt xem cho bài viết:', postId);
        })
        .catch(err => {
          console.error('Lỗi khi cập nhật lượt xem:', err);
        });
      
      // Chuyển hướng đến trang chi tiết
      navigate(`/forum/post/${postId}`);
    } catch (error) {
      console.error('Lỗi khi xử lý chi tiết bài viết:', error);
      setError('Không thể xem chi tiết bài viết. Vui lòng thử lại sau.');
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await forumAPI.likePost(postId);
      if (response.data && response.data.success) {
        // Cập nhật trạng thái like cho bài viết trong tất cả các danh sách
        const updatePostLike = (postList) => {
          return postList.map(post => 
            post._id === postId 
              ? { 
                  ...post, 
                  likes: post.userLiked ? post.likes - 1 : post.likes + 1,
                  userLiked: !post.userLiked 
                } 
              : post
          );
        };
        
        setPosts(updatePostLike(posts));
      }
    } catch (error) {
      console.error('Lỗi khi thích bài viết:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      // Hiển thị xác nhận trước khi xóa
      if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
        return;
      }
      
      console.log('Đang xóa bài viết có ID:', postId);
      const response = await forumAPI.deletePost(postId);
      
      if (response.data && response.data.success) {
        // Cập nhật danh sách bài viết sau khi xóa
        setPosts(posts.filter(post => post._id !== postId));
        setError('');
        // Hiển thị thông báo thành công
        alert('Đã xóa bài viết thành công');
      }
    } catch (error) {
      console.error('Lỗi khi xóa bài viết:', error);
      const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        'Không thể xóa bài viết. Vui lòng thử lại sau.';
      setError(`Lỗi: ${errorMessage}`);
    }
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
      case 'comments':
        filteredPosts.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
        break;
      case 'views':
        filteredPosts.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      default:
        break;
    }

    return filteredPosts;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 0) {
      setSortBy('newest');
    } else if (newValue === 1) {
      setSortBy('trending');
    } else if (newValue === 2) {
      setSortBy('comments');
    } else if (newValue === 3) {
      setSortBy('views');
    }
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const toggleFilterDrawer = () => {
    setFilterDrawerOpen(!filterDrawerOpen);
  };

  // Tạo menu điều hướng di động
  const mobileDrawer = (
    <Drawer
      variant="temporary"
      open={mobileDrawerOpen}
      onClose={toggleMobileDrawer}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': { 
          width: 280,
          backgroundColor: theme.palette.background.default,
          boxSizing: 'border-box' 
        },
      }}
    >
      <Box sx={{ py: 2, px: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar 
          src={getAvatarUrl(user?.avatar)}
          sx={{ width: 40, height: 40 }}
        >
          {user?.name?.charAt(0) || '?'}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {user?.name || 'Người dùng'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sinh viên
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ pt: 1 }}>
        <ListItem button component="a" href="/">
          <ListItemIcon>
            <MenuIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Trang chủ" />
        </ListItem>
        <ListItem button selected component="a" href="/forum">
          <ListItemIcon>
            <MenuIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Diễn đàn" />
        </ListItem>
      </List>
      <Divider />
      <List sx={{ pt: 1 }}>
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
          Danh mục
        </Typography>
        {categories.map((category) => (
          <ListItem 
            button 
            key={category}
            selected={selectedCategory === category}
            onClick={() => {
              setSelectedCategory(category);
              toggleMobileDrawer();
            }}
          >
            <ListItemText primary={category} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );

  // Menu bộ lọc
  const filterDrawer = (
    <Drawer
      anchor="right"
      variant="temporary"
      open={filterDrawerOpen}
      onClose={toggleFilterDrawer}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': { 
          width: 300,
          backgroundColor: theme.palette.background.default,
          boxSizing: 'border-box',
          p: 2
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Bộ lọc</Typography>
        <IconButton onClick={toggleFilterDrawer}>
          <Close />
        </IconButton>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Typography variant="subtitle1" gutterBottom fontWeight="medium">
        Sắp xếp theo
      </Typography>
      <Box sx={{ mb: 3 }}>
        {['newest', 'trending', 'comments', 'views'].map((option) => (
          <Button 
            key={option}
            variant={sortBy === option ? "contained" : "outlined"}
            onClick={() => setSortBy(option)}
            sx={{ 
              textTransform: 'none',
              justifyContent: 'flex-start',
              borderRadius: 2
            }}
          >
            {option === 'newest' ? 'Mới nhất' :
             option === 'trending' ? 'Thịnh hành' :
             option === 'comments' ? 'Bình luận nhiều' :
             'Xem nhiều'}
          </Button>
        ))}
      </Box>
      
      <Typography variant="subtitle1" gutterBottom fontWeight="medium">
        Danh mục
      </Typography>
      <Box>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "contained" : "outlined"}
            onClick={() => setSelectedCategory(category)}
            sx={{ 
              textTransform: 'none',
              justifyContent: 'flex-start',
              borderRadius: 2
            }}
          >
            {category}
          </Button>
        ))}
      </Box>
    </Drawer>
  );

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5',
        minHeight: '100vh',
        backgroundImage: theme.palette.mode === 'dark' 
          ? 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://upload-os-bbs.hoyolab.com/upload/2021/03/29/1012457/181b950db0ae7da91a0d9c09d94b1827_7756524374088638720.png?x-oss-process=image/resize,s_1000/quality,q_80/auto-orient,0/interlace,1/format,jpg")'
          : 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url("https://upload-os-bbs.hoyolab.com/upload/2021/03/29/1012457/181b950db0ae7da91a0d9c09d94b1827_7756524374088638720.png?x-oss-process=image/resize,s_1000/quality,q_80/auto-orient,0/interlace,1/format,jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Top AppBar - fixed position */}
      <AppBar 
        position="fixed" 
        color="default" 
        elevation={0}
        sx={{ 
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
            {isMobile ? (
              <IconButton onClick={toggleMobileDrawer} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            ) : null}
            
            <Typography 
              variant="h6" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                flexGrow: { xs: 1, sm: 0 }
              }}
            >
              Diễn đàn sinh viên
            </Typography>
            
            {!isMobile && (
              <Tabs 
                value={selectedCategory === 'Tất cả' ? 0 : categories.findIndex(c => c === selectedCategory)}
                onChange={(e, val) => setSelectedCategory(categories[val])}
                sx={{ 
                  mx: 2, 
                  flexGrow: 1,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    minWidth: 0,
                    px: 2
                  }
                }}
                variant="scrollable"
                scrollButtons="auto"
              >
                {categories.slice(0, isMobile ? 3 : 6).map((category) => (
                  <Tab key={category} label={category} />
                ))}
              </Tabs>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={toggleFilterDrawer}
                sx={{ 
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  borderRadius: 1.5
                }}
              >
                <Sort fontSize="small" />
              </IconButton>
              
              {!isMobile && (
                <TextField
                  placeholder="Tìm kiếm bài viết..."
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                    sx: { 
                      borderRadius: 5, 
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : theme.palette.background.paper 
                    }
                  }}
                  sx={{ width: 200 }}
                />
              )}
              
              <Avatar
                src={getAvatarUrl(user?.avatar)}
                sx={{ 
                  width: 36, 
                  height: 36,
                  border: `2px solid ${theme.palette.primary.main}`,
                  cursor: 'pointer' 
                }}
                onClick={() => navigate('/profile')}
              >
                {user?.name?.charAt(0) || '?'}
              </Avatar>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Toolbar spacer */}
      <Toolbar />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Header Hero Section */}
        <Box 
          sx={{ 
            mb: 3, 
            p: 3,
            borderRadius: 3,
            backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
            color: '#fff',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box 
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: 'url("https://img-os-static.hoyolab.com/communityWeb/upload/1664440375832226619.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Diễn đàn sinh viên
            </Typography>
            <Typography variant="subtitle1" sx={{ maxWidth: 600, mb: 3 }}>
              Tham gia cộng đồng sinh viên năng động, chia sẻ kiến thức, kinh nghiệm và kết nối với các bạn cùng trường!
            </Typography>
            
            <Button
              variant="contained"
              color="info"
              startIcon={<Add />}
              onClick={() => setOpenCreate(true)}
              sx={{ 
                borderRadius: 6,
                px: 3,
                py: 1,
                backgroundColor: 'white',
                color: theme.palette.primary.main,
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.85)'
                }
              }}
            >
              Tạo bài viết mới
            </Button>
          </Box>
        </Box>

        {/* Main Layout */}
        <Grid container spacing={3}>
          {/* Left Sidebar */}
          {!isMobile && !isTablet && (
            <Grid item xs={3}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  borderRadius: 3, 
                  position: 'sticky', 
                  top: 80,
                  backgroundColor: theme.palette.background.paper
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Danh mục
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      color={selectedCategory === category ? 'primary' : 'inherit'}
                      onClick={() => setSelectedCategory(category)}
                      sx={{
                        justifyContent: 'flex-start',
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        backgroundColor: selectedCategory === category ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                        '&:hover': {
                          backgroundColor: selectedCategory === category ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)'
                        },
                        textTransform: 'none'
                      }}
                    >
                      {category}
                    </Button>
                  ))}
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Main Content */}
          <Grid item xs={12} sm={12} md={!isMobile && !isTablet ? 9 : 12}>
            {/* Create Post Card */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 3, 
                borderRadius: 3,
                backgroundColor: theme.palette.background.paper
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  src={getAvatarUrl(user?.avatar)}
                  sx={{ width: 40, height: 40 }}
                >
                  {user?.name?.charAt(0)}
                </Avatar>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setOpenCreate(true)}
                  sx={{
                    borderRadius: 5,
                    justifyContent: 'flex-start',
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    color: theme.palette.text.secondary,
                    borderColor: theme.palette.divider,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      borderColor: theme.palette.divider,
                    }
                  }}
                >
                  {`Đăng bài viết của bạn...`}
                </Button>
              </Box>
            </Paper>

            {/* Filter Tabs - HoYoLAB Style */}
            <Paper
              elevation={0} 
              sx={{ 
                mb: 3, 
                borderRadius: 3,
                backgroundColor: theme.palette.background.paper,
                overflow: 'hidden'
              }}
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0'
                  },
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 'medium',
                    py: 1.5
                  }
                }}
              >
                <Tab 
                  icon={<Sort fontSize="small" />} 
                  label={isMobile ? '' : 'Mới nhất'} 
                  iconPosition="start" 
                />
                <Tab 
                  icon={<Sort fontSize="small" />} 
                  label={isMobile ? '' : 'Thịnh hành'} 
                  iconPosition="start"
                />
                <Tab 
                  icon={<Sort fontSize="small" />} 
                  label={isMobile ? '' : 'Bình luận nhiều'} 
                  iconPosition="start"
                />
                <Tab 
                  icon={<Sort fontSize="small" />} 
                  label={isMobile ? '' : 'Xem nhiều'} 
                  iconPosition="start"
                />
              </Tabs>
            </Paper>

            {isMobile && (
              <TextField
                id="mobile-search"
                fullWidth
                placeholder="Tìm kiếm bài viết..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 5 }
                }}
                sx={{ mb: 3 }}
              />
            )}

            {/* Loading Indicator */}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {/* Empty State */}
            {!loading && filterAndSortPosts().length === 0 && (
              <Paper
                elevation={0} 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 3,
                  backgroundColor: theme.palette.background.paper
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Chưa có bài viết nào trong danh mục này
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Hãy là người đầu tiên chia sẻ trong danh mục này
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenCreate(true)}
                  sx={{ 
                    borderRadius: 5, 
                    textTransform: 'none',
                    px: 3,
                    py: 1
                  }}
                >
                  Tạo bài viết mới
                </Button>
              </Paper>
            )}

            {/* User Posts - Sử dụng component ForumPost với thiết kế giống HoYoLAB */}
            {filterAndSortPosts().length > 0 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Bài viết gần đây
                </Typography>
                
                {filterAndSortPosts().map((post) => (
                  <ForumPost
                    key={post._id}
                    post={post}
                    onViewDetails={handleViewPostDetail}
                    onLikePost={handleLikePost}
                    onDeletePost={handleDeletePost}
                    currentUser={user}
                  />
                ))}
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Mobile & Filter Drawer */}
        {mobileDrawer}
        {filterDrawer}

        {/* Create Post Dialog */}
        <CreatePost
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          onSubmit={handleCreatePost}
          categories={categories.filter(cat => cat !== 'Tất cả')}
          userData={user}
        />
      </Container>
    </Box>
  );
};

export default Forum;