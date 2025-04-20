import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  Chip,
  List,
  ListItem,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Button,
  Tooltip,
  Stack,
  useTheme,
  IconButton,
  Tab,
  Tabs,
  Alert
} from '@mui/material';
import {
  School,
  Email,
  Badge as BadgeIcon,
  CalendarMonth,
  Visibility,
  Comment as CommentIcon,
  ThumbUp,
  ArrowForward,
  ArrowBack,
  Person,
  PersonAdd,
  PersonRemove
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getAvatarUrl } from '../utils/api';
import moment from 'moment';
import 'moment/locale/vi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api'; // Import API instance đã cấu hình

moment.locale('vi');

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
      style={{ padding: '1rem 0' }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user: currentUser } = useAuth();
  
  // State for profile data
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  
  // State for UI
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [following, setFollowing] = useState(false);

  // Fetch user profile data on component mount
  useEffect(() => {
    console.log("UserProfile - userId from params:", userId);
    
    if (!userId) {
      setError('Không tìm thấy ID người dùng');
      setLoading(false);
      return;
    }
    
    fetchUserProfile();
    fetchUserPosts();
  }, [userId]);

  // Function to fetch user profile
  const fetchUserProfile = async () => {
    if (!userId) {
      console.error("fetchUserProfile - userId is undefined");
      return;
    }
    
    try {
      setLoading(true);
      console.log(`Fetching user profile: /api/users/${userId}`);
      
      // Sử dụng API instance đã cấu hình thay vì axios trực tiếp
      const response = await api.get(`/users/${userId}`);
      console.log("User profile API response:", response.data);
      
      if (response.data && response.data.success) {
        setUserData(response.data.user);
        
        // Check if current user is following this user
        if (currentUser && response.data.isFollowing !== undefined) {
          setFollowing(response.data.isFollowing);
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu người dùng:', error.response || error);
      setError(
        error.response?.status === 401 
          ? 'Vui lòng đăng nhập để xem thông tin người dùng' 
          : 'Không thể tải thông tin người dùng. Người dùng không tồn tại hoặc bạn không có quyền xem.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch user posts
  const fetchUserPosts = async () => {
    if (!userId) {
      console.error("fetchUserPosts - userId is undefined");
      return;
    }
    
    try {
      setPostsLoading(true);
      console.log(`Fetching user posts: /api/users/${userId}/posts`);
      
      // Sử dụng API instance đã cấu hình thay vì axios trực tiếp
      const response = await api.get(`/users/${userId}/posts`);
      console.log("User posts API response:", response.data);
      
      if (response.data && response.data.success) {
        setUserPosts(response.data.posts || []);
      }
    } catch (error) {
      console.error('Lỗi khi lấy bài viết của người dùng:', error.response || error);
    } finally {
      setPostsLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Navigate to post detail
  const handleViewPost = (postId) => {
    navigate(`/forum/post/${postId}`);
  };

  // Follow/Unfollow user
  const handleToggleFollow = async () => {
    if (!userId) {
      console.error("handleToggleFollow - userId is undefined");
      return;
    }
    
    try {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      // Sử dụng API instance đã cấu hình
      const response = await api.post(`/users/${userId}/${following ? 'unfollow' : 'follow'}`);
      if (response.data && response.data.success) {
        setFollowing(!following);
      }
    } catch (error) {
      console.error('Lỗi khi thực hiện theo dõi/hủy theo dõi:', error.response || error);
    }
  };

  // Display role in Vietnamese
  const getRoleDisplay = (role) => {
    const roleMap = {
      'student': 'Sinh viên',
      'teacher': 'Giáo viên',
      'admin': 'Quản trị viên',
      'superAdmin': 'Quản trị viên cấp cao'
    };
    return roleMap[role] || role;
  };

  // Loading state display
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state display
  if (error || !userData) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || `Không tìm thấy người dùng với ID: ${userId}`}
        </Alert>
        <Typography variant="body1" gutterBottom>
          Có thể người dùng không tồn tại hoặc bạn không có quyền truy cập.
        </Typography>
        <Button 
          startIcon={<ArrowBack />} 
          variant="contained" 
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Quay lại
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 3 }}>
        <IconButton 
          onClick={() => navigate(-1)} 
          sx={{ 
            mb: 1,
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
            }
          }}
        >
          <ArrowBack />
        </IconButton>
      </Box>

      <Grid container spacing={4}>
        {/* Left column - User info & avatar */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              mb: 3,
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(to bottom right, #1a2035, #121212)'
                : 'linear-gradient(to bottom right, #f5f7fa, #e4e9f2)'
            }}
          >
            <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={getAvatarUrl(userData.avatar)}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mb: 2, 
                  mx: 'auto', 
                  fontSize: '3rem',
                  border: '4px solid white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                {userData.name?.charAt(0)}
              </Avatar>
              
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                {userData.name}
              </Typography>
              
              <Chip 
                label={getRoleDisplay(userData.role)} 
                color={userData.role === 'student' ? 'primary' : 'secondary'} 
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ width: '100%', mt: 2 }}>
                <List sx={{ width: '100%' }}>
                  <ListItem sx={{ py: 1.5 }}>
                    <BadgeIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                    <Typography variant="body1">{userData.username}</Typography>
                  </ListItem>
                  
                  {userData.role === 'student' && (
                    <>
                      <Divider variant="inset" component="li" />
                      <ListItem sx={{ py: 1.5 }}>
                        <School sx={{ mr: 2, color: theme.palette.primary.main }} />
                        <Typography variant="body1">{userData.studentId}</Typography>
                      </ListItem>
                    </>
                  )}
                  
                  {(currentUser && currentUser.role === 'admin') && (
                    <>
                      <Divider variant="inset" component="li" />
                      <ListItem sx={{ py: 1.5 }}>
                        <Email sx={{ mr: 2, color: theme.palette.primary.main }} />
                        <Typography variant="body1">{userData.email}</Typography>
                      </ListItem>
                    </>
                  )}
                  
                  <Divider variant="inset" component="li" />
                  
                  <ListItem sx={{ py: 1.5 }}>
                    <CalendarMonth sx={{ mr: 2, color: theme.palette.primary.main }} />
                    <Typography variant="body1">
                      Tham gia: {userData.createdAt ? moment(userData.createdAt).format('DD/MM/YYYY') : 'N/A'}
                    </Typography>
                  </ListItem>
                </List>
              </Box>
              
              {currentUser && currentUser.id !== userId && (
                <Button 
                  variant="contained" 
                  fullWidth 
                  sx={{ mt: 2 }}
                  startIcon={following ? <PersonRemove /> : <PersonAdd />}
                  color={following ? "secondary" : "primary"}
                  onClick={handleToggleFollow}
                >
                  {following ? 'Hủy theo dõi' : 'Theo dõi'}
                </Button>
              )}
            </Box>
          </Paper>

          {/* Bio section */}
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(to bottom right, #1a2035, #121212)'
                : 'linear-gradient(to bottom right, #f5f7fa, #e4e9f2)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Giới thiệu</Typography>
            </Box>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {userData.bio || 'Chưa có thông tin giới thiệu.'}
            </Typography>

            {userData.role === 'student' && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Thông tin học tập
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Lớp</Typography>
                    <Typography variant="body1">{userData.class || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Chuyên ngành</Typography>
                    <Typography variant="body1">{userData.major || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right column - Tabs content (Info, Posts) */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            {/* Tabs header */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                variant="fullWidth"
                textColor="primary"
                indicatorColor="primary"
              >
                <Tab label="Hoạt động" />
                <Tab label="Bài viết" />
              </Tabs>
            </Box>

            {/* Activity tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Hoạt động gần đây
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      backgroundColor: theme.palette.primary.main,
                      color: 'white'
                    }}
                  >
                    <ThumbUp />
                  </Box>
                  <Box>
                    <Typography variant="body1"><strong>{userPosts.reduce((sum, post) => sum + (post.likes || 0), 0)}</strong> lượt thích</Typography>
                    <Typography variant="body2" color="text.secondary">Tổng số lượt thích nhận được từ bài viết</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      backgroundColor: theme.palette.info.main,
                      color: 'white'
                    }}
                  >
                    <CommentIcon />
                  </Box>
                  <Box>
                    <Typography variant="body1"><strong>{userPosts.reduce((sum, post) => sum + (post.comments?.length || 0), 0)}</strong> bình luận</Typography>
                    <Typography variant="body2" color="text.secondary">Tổng số bình luận nhận được từ bài viết</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      backgroundColor: theme.palette.warning.main,
                      color: 'white'
                    }}
                  >
                    <Visibility />
                  </Box>
                  <Box>
                    <Typography variant="body1"><strong>{userPosts.reduce((sum, post) => sum + (post.views || 0), 0)}</strong> lượt xem</Typography>
                    <Typography variant="body2" color="text.secondary">Tổng số lượt xem trên tất cả bài viết</Typography>
                  </Box>
                </Box>
              </Box>
            </TabPanel>

            {/* User posts tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ px: 1 }}>
                  Bài viết của {userData.name} ({userPosts.length})
                </Typography>
                
                {postsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : userPosts.length > 0 ? (
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {userPosts.map((post) => (
                      <Card 
                        key={post._id} 
                        sx={{ 
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          '&:hover': { 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => handleViewPost(post._id)}
                      >
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {post.title}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {post.content?.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                          </Typography>
                          
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip 
                                label={post.category} 
                                size="small"
                                sx={{ fontSize: '0.75rem' }}
                              />
                              
                              {post.tags && post.tags.length > 0 && (
                                <Chip 
                                  label={`${post.tags.length} tag${post.tags.length > 1 ? 's' : ''}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.75rem' }}
                                />
                              )}
                            </Box>
                            
                            <Typography variant="caption" color="text.secondary">
                              {moment(post.createdAt).format('DD/MM/YYYY')}
                            </Typography>
                          </Box>
                        </CardContent>
                        
                        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Tooltip title="Lượt xem">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Visibility fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  {post.views || 0}
                                </Typography>
                              </Box>
                            </Tooltip>
                            
                            <Tooltip title="Bình luận">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CommentIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  {post.comments?.length || 0}
                                </Typography>
                              </Box>
                            </Tooltip>
                          </Box>
                          
                          <Button 
                            endIcon={<ArrowForward />} 
                            size="small"
                            sx={{ textTransform: 'none' }}
                          >
                            Xem chi tiết
                          </Button>
                        </CardActions>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ py: 5, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      Người dùng này chưa có bài viết nào.
                    </Typography>
                  </Box>
                )}
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserProfile;