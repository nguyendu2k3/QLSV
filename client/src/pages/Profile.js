import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Box,
  Alert,
  IconButton,
  Tab,
  Tabs,
  List,
  ListItem,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Chip,
  Tooltip,
  Badge,
  Stack
} from '@mui/material';
import {
  PhotoCamera,
  Save,
  Visibility,
  VisibilityOff,
  Edit,
  School,
  Email,
  Badge as BadgeIcon,
  CalendarMonth,
  MoreVert,
  ArrowForward
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { authAPI, getAvatarUrl, getMediaUrl } from '../utils/api';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/vi';
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

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams();

  // Determine if viewing own profile or another user's
  const isOwnProfile = !userId || (user && userId === user.id);
  
  // State for profile data
  const [profileData, setProfileData] = useState({
    username: '',
    name: '',
    email: '',
    studentId: '',
    bio: '',
    avatar: null,
    role: '',
    createdAt: '',
    class: '',
    major: ''
  });

  // State for user's posts
  const [userPosts, setUserPosts] = useState([]);
  
  // State for UI
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // State for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Fetch profile data on component mount
  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
  }, [userId]);

  // Function to fetch user profile
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile(userId);
      if (response.data && response.data.success) {
        const userData = response.data.user;
        setProfileData({
          username: userData.username || '',
          name: userData.name || '',
          email: userData.email || '',
          studentId: userData.studentId || '',
          bio: userData.bio || '',
          avatar: userData.avatar || null,
          role: userData.role || 'student',
          createdAt: userData.createdAt || '',
          class: userData.class || '',
          major: userData.major || 'Công nghệ thông tin'
        });
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu profile:', error);
      setError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch user posts
  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await authAPI.getUserPosts(userId);
      if (response.data && response.data.success) {
        setUserPosts(response.data.posts || []);
      }
    } catch (error) {
      console.error('Lỗi khi lấy bài viết của người dùng:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  // Handle profile form changes
  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  // Handle profile form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoadingUpdate(true);

    try {
      const response = await authAPI.updateProfile({
        name: profileData.name,
        email: profileData.email,
        bio: profileData.bio
      });

      if (response.data && response.data.success) {
        setSuccess('Cập nhật thông tin thành công');
        const userData = response.data.user;
        setProfileData(prev => ({
          ...prev,
          name: userData.name,
          email: userData.email,
          bio: userData.bio
        }));
        
        if (updateUser) {
          updateUser({
            ...user,
            name: userData.name,
            email: userData.email,
            bio: userData.bio
          });
        }
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật profile:', error);
      setError(
        error.response?.data?.message || 
        'Cập nhật thất bại. Vui lòng thử lại sau.'
      );
    } finally {
      setLoadingUpdate(false);
    }
  };

  // Handle avatar upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await authAPI.uploadAvatar(formData);
      
      if (response.data && response.data.success) {
        setSuccess('Upload ảnh đại diện thành công');
        setProfileData(prev => ({
          ...prev,
          avatar: response.data.avatarUrl
        }));
        
        if (updateUser) {
          updateUser({
            ...user,
            avatar: response.data.avatarUrl
          });
        }
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Lỗi khi upload ảnh:', error);
      setError('Upload ảnh thất bại. Vui lòng thử lại.');
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Open password change dialog
  const handleOpenPasswordDialog = () => {
    setPasswordDialog(true);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
    setPasswordSuccess('');
  };

  // Close password change dialog
  const handleClosePasswordDialog = () => {
    setPasswordDialog(false);
  };

  // Handle password change submit
  const handlePasswordSubmit = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Vui lòng điền đầy đủ thông tin mật khẩu');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Mật khẩu mới không khớp với mật khẩu xác nhận');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    
    try {
      setChangingPassword(true);
      const response = await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data && response.data.success) {
        setPasswordSuccess('Đổi mật khẩu thành công');
        setTimeout(() => {
          handleClosePasswordDialog();
        }, 1500);
      }
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      setPasswordError(
        error.response?.data?.message || 
        'Đổi mật khẩu thất bại. Vui lòng thử lại sau.'
      );
    } finally {
      setChangingPassword(false);
    }
  };
  
  // Navigate to post detail
  const handleViewPost = (postId) => {
    navigate(`/forum/post/${postId}`);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Grid container spacing={4}>
        {/* Left column - User info & avatar */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              mb: 3,
              background: 'linear-gradient(to bottom right, #f5f7fa, #e4e9f2)'
            }}
          >
            <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  isOwnProfile && (
                    <label htmlFor="icon-button-file">
                      <IconButton
                        component="span"
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'white',
                          '&:hover': { backgroundColor: 'primary.dark' }
                        }}
                        size="small"
                      >
                        <PhotoCamera fontSize="small" />
                      </IconButton>
                    </label>
                  )
                }
              >
                <Avatar
                  src={getAvatarUrl(profileData.avatar)}
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
                  {profileData.name.charAt(0)}
                </Avatar>
              </Badge>
              {isOwnProfile && (
                <input
                  accept="image/*"
                  type="file"
                  id="icon-button-file"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
              )}
              
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                {profileData.name}
              </Typography>
              
              <Chip 
                label={getRoleDisplay(profileData.role)} 
                color={profileData.role === 'student' ? 'primary' : 'secondary'} 
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ width: '100%', mt: 2 }}>
                <List sx={{ width: '100%' }}>
                  <ListItem sx={{ py: 1.5 }}>
                    <BadgeIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="body1">{profileData.username}</Typography>
                  </ListItem>
                  
                  <Divider variant="inset" component="li" />
                  
                  <ListItem sx={{ py: 1.5 }}>
                    <School sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="body1">{profileData.studentId}</Typography>
                  </ListItem>
                  
                  <Divider variant="inset" component="li" />
                  
                  <ListItem sx={{ py: 1.5 }}>
                    <Email sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="body1">{profileData.email}</Typography>
                  </ListItem>
                  
                  <Divider variant="inset" component="li" />
                  
                  <ListItem sx={{ py: 1.5 }}>
                    <CalendarMonth sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="body1">
                      Tham gia: {profileData.createdAt ? moment(profileData.createdAt).format('DD/MM/YYYY') : 'N/A'}
                    </Typography>
                  </ListItem>
                </List>
              </Box>
              
              {isOwnProfile && (
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ mt: 2 }}
                  onClick={handleOpenPasswordDialog}
                >
                  Đổi mật khẩu
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
              background: 'linear-gradient(to bottom right, #f5f7fa, #e4e9f2)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Giới thiệu</Typography>
            </Box>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {profileData.bio || 'Chưa có thông tin giới thiệu.'}
            </Typography>

            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Thông tin học tập
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Lớp</Typography>
                  <Typography variant="body1">{profileData.class || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Chuyên ngành</Typography>
                  <Typography variant="body1">{profileData.major || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Right column - Tabs content (Info, Posts, Settings) */}
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
                <Tab label="Thông tin cá nhân" />
                <Tab label="Bài viết" />
              </Tabs>
            </Box>

            {/* Edit profile tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: 3 }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
                    {success}
                  </Alert>
                )}
                
                {isOwnProfile && (
                  <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                          Chỉnh sửa thông tin
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Họ và tên"
                          name="name"
                          value={profileData.name}
                          onChange={handleChange}
                          variant="outlined"
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          value={profileData.email}
                          onChange={handleChange}
                          variant="outlined"
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Tên đăng nhập"
                          name="username"
                          value={profileData.username}
                          variant="outlined"
                          disabled
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Mã số sinh viên"
                          name="studentId"
                          value={profileData.studentId}
                          variant="outlined"
                          disabled
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Giới thiệu"
                          name="bio"
                          multiline
                          rows={6}
                          value={profileData.bio}
                          onChange={handleChange}
                          variant="outlined"
                          placeholder="Viết một vài điều về bản thân..."
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={loadingUpdate ? <CircularProgress size={20} color="inherit" /> : <Save />}
                          disabled={loadingUpdate}
                          sx={{ borderRadius: 2 }}
                        >
                          {loadingUpdate ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* User posts tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ px: 1 }}>
                  Bài viết của tôi ({userPosts.length})
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
                                <BadgeIcon fontSize="small" color="action" />
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
                      Bạn chưa có bài viết nào.
                    </Typography>
                    <Button 
                      variant="contained" 
                      sx={{ mt: 2, borderRadius: 2 }}
                      onClick={() => navigate('/forum')}
                    >
                      Tạo bài viết mới
                    </Button>
                  </Box>
                )}
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      {/* Password change dialog */}
      <Dialog open={passwordDialog} onClose={handleClosePasswordDialog}>
        <DialogTitle>Đổi mật khẩu</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Để thay đổi mật khẩu, vui lòng nhập mật khẩu hiện tại và mật khẩu mới.
          </DialogContentText>
          
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPasswordError('')}>
              {passwordError}
            </Alert>
          )}
          
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPasswordSuccess('')}>
              {passwordSuccess}
            </Alert>
          )}
          
          <TextField
            margin="dense"
            name="currentPassword"
            label="Mật khẩu hiện tại"
            type={showCurrentPassword ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    edge="end"
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            name="newPassword"
            label="Mật khẩu mới"
            type={showNewPassword ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
          />
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClosePasswordDialog}>Hủy</Button>
          <Button 
            onClick={handlePasswordSubmit} 
            variant="contained" 
            disabled={changingPassword}
            startIcon={changingPassword ? <CircularProgress size={20} /> : null}
          >
            {changingPassword ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;