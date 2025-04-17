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
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import { PhotoCamera, Save } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { authAPI, getAvatarUrl } from '../utils/api';
import moment from 'moment';
import 'moment/locale/vi';
moment.locale('vi');

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    username: '',
    name: '',
    email: '',
    studentId: '',
    bio: '',
    avatar: null
  });
  const [loading, setLoading] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [activities] = useState([
    {
      type: 'forum',
      action: 'đã tạo bài viết',
      target: 'Hỏi về bài tập Java',
      date: '2025-03-19T01:20:00Z'
    },
    {
      type: 'profile',
      action: 'đã cập nhật thông tin',
      target: 'hồ sơ cá nhân',
      date: '2025-03-19T01:15:00Z'
    }
  ]);

  useEffect(() => {
    // Lấy thông tin profile từ API
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await authAPI.getProfile();
        if (response.data && response.data.success) {
          const userData = response.data.user;
          setProfileData({
            username: userData.username,
            name: userData.name,
            email: userData.email,
            studentId: userData.studentId,
            bio: userData.bio || 'Sinh viên năm 2 ngành Công nghệ thông tin',
            avatar: userData.avatar
          });
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu profile:', error);
        setError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoadingUpdate(true);

    try {
      // Gửi request cập nhật thông tin
      const response = await authAPI.updateProfile({
        name: profileData.name,
        email: profileData.email,
        bio: profileData.bio
      });

      if (response.data && response.data.success) {
        setSuccess('Cập nhật thông tin thành công');
        // Cập nhật lại dữ liệu từ response nếu cần
        const userData = response.data.user;
        setProfileData(prev => ({
          ...prev,
          name: userData.name,
          email: userData.email
        }));
        
        // Cập nhật thông tin trong context toàn cục
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      // Upload ảnh đại diện
      const response = await authAPI.uploadAvatar(formData);
      
      if (response.data && response.data.success) {
        setSuccess('Upload ảnh thành công');
        // Cập nhật avatar URL trong state
        setProfileData(prev => ({
          ...prev,
          avatar: response.data.avatarUrl
        }));
        
        // Cập nhật avatar trong context toàn cục để tất cả component có thể nhận được
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                src={getAvatarUrl(profileData.avatar)}
                sx={{ width: 150, height: 150, mb: 2, mx: 'auto', fontSize: '3rem' }}
              >
                {profileData.name.charAt(0)}
              </Avatar>
              <input
                accept="image/*"
                type="file"
                id="icon-button-file"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <label htmlFor="icon-button-file">
                <IconButton
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': { backgroundColor: 'primary.dark' }
                  }}
                >
                  <PhotoCamera />
                </IconButton>
              </label>
            </Box>
            <Typography variant="h6" gutterBottom>
              {profileData.name}
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              {profileData.studentId}
            </Typography>
            <Typography color="textSecondary">
              Tham gia: {moment('2025-03-19T01:24:20Z').format('DD/MM/YYYY')}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Thông tin cá nhân" />
                <Tab label="Hoạt động gần đây" />
              </Tabs>
            </Box>

            {tabValue === 0 && (
              <Box component="form" onSubmit={handleSubmit}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                    {success}
                  </Alert>
                )}
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mã số sinh viên"
                      name="studentId"
                      value={profileData.studentId}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Giới thiệu"
                      name="bio"
                      multiline
                      rows={4}
                      value={profileData.bio}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={loadingUpdate ? <CircularProgress size={24} color="inherit" /> : <Save />}
                      disabled={loadingUpdate}
                    >
                      {loadingUpdate ? 'Đang xử lý...' : 'Lưu thay đổi'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}

            {tabValue === 1 && (
              <List>
                {activities.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={`${profileData.name} ${activity.action} "${activity.target}"`}
                        secondary={moment(activity.date).fromNow()}
                      />
                    </ListItem>
                    {index < activities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;