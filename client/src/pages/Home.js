import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
} from '@mui/material';
import {
  School,
  Group,
  Forum as ForumIcon,
  Assignment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const stats = [
    {
      title: 'Số bài viết',
      value: '150+',
      icon: <ForumIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Sinh viên',
      value: '1000+',
      icon: <Group sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
    {
      title: 'Khóa học',
      value: '50+',
      icon: <School sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
    {
      title: 'Bài tập',
      value: '300+',
      icon: <Assignment sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Xin chào, {user?.name}!
        </Typography>
        <Typography color="text.secondary">
          Chào mừng bạn đến với hệ thống Quản lý Sinh viên
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                bgcolor: 'background.default',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: stat.color,
                  width: 56,
                  height: 56,
                  mb: 2,
                }}
              >
                {stat.icon}
              </Avatar>
              <Typography variant="h4" component="div" gutterBottom>
                {stat.value}
              </Typography>
              <Typography color="text.secondary">
                {stat.title}
              </Typography>
            </Paper>
          </Grid>
        ))}

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thông báo mới
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  🎓 Đăng ký học phần học kỳ 2 năm 2024-2025
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thời gian đăng ký: 15/03/2025 - 30/03/2025
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  📢 Hội thảo "Công nghệ AI trong Giáo dục"
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thời gian: 25/03/2025, 14:00 - 17:00
                </Typography>
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small">Xem tất cả</Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hoạt động gần đây
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {new Date().toLocaleDateString('vi-VN')}
                </Typography>
                <Typography variant="subtitle2">
                  Đăng bài trong diễn đàn
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {new Date().toLocaleDateString('vi-VN')}
                </Typography>
                <Typography variant="subtitle2">
                  Cập nhật thông tin cá nhân
                </Typography>
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/profile')}>
                Xem hồ sơ
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;