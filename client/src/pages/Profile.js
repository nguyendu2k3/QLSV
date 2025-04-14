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
  Divider
} from '@mui/material';
import { PhotoCamera, Save } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
// import { authAPI } from '../utils/api';
import moment from 'moment';
import 'moment/locale/vi';
moment.locale('vi');

const Profile = () => {
  const { user } = useAuth();  // Giữ lại vì chúng ta sẽ dùng
  const [profileData, setProfileData] = useState({
    username: user?.username || 'nguyendu2k3',
    name: user?.name || 'nguyendu',
    email: user?.email || 'nguyendu2k3@example.com',
    studentId: user?.studentId || 'SV001',
    bio: user?.bio || 'Sinh viên năm 2 ngành Công nghệ thông tin'
  });
  const [loading, setLoading] = useState(true);
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
    // Giả lập API call
    setLoading(false);
  }, []);

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Giả lập API call
      setSuccess('Cập nhật thông tin thành công');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Cập nhật thất bại');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setSuccess('Upload ảnh thành công');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Upload ảnh thất bại');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return <Typography>Đang tải...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
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
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ mb: 2 }}>
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
                      startIcon={<Save />}
                    >
                      Lưu thay đổi
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