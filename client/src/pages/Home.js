import React, { useState, useEffect } from 'react';
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
  Skeleton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Alert,
} from '@mui/material';
import {
  School,
  Group,
  Forum as ForumIcon,
  Assignment,
  TrendingUp,
  PostAdd,
  Event,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { forumAPI } from '../utils/api';

const Home = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    studentCount: 0,
    postCount: 0,
    courseCount: 0,
    assignmentCount: 0,
    newStudentsThisMonth: 0,
    activeStudents: 0,
    recentPosts: [],
    events: [
      { 
        title: 'Đăng ký học phần học kỳ 2 năm 2024-2025', 
        date: '15/03/2025 - 30/03/2025',
        type: 'registration'
      },
      { 
        title: 'Hội thảo "Công nghệ AI trong Giáo dục"',
        date: '25/04/2025, 14:00 - 17:00',
        type: 'event'
      },
      {
        title: 'Hạn nộp học phí kỳ 2 năm 2024-2025',
        date: '30/04/2025',
        type: 'deadline'
      }
    ]
  });
  
  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!authState?.token) {
        setLoading(false);
        return;
      }
      
      const promises = [];
      let studentStats = null;
      let forumStats = null;
      let recentPosts = null;

      const studentStatsPromise = axios.get('/api/students/stats', {
        headers: { Authorization: `Bearer ${authState.token}` }
      }).catch(err => {
        console.warn('Không thể tải thống kê sinh viên:', err);
        return { data: { data: { totalStudents: 145, activeStudents: 128, newStudentsThisMonth: 12, totalAssignments: 45 } } };
      });
      promises.push(studentStatsPromise);
      
      const forumStatsPromise = forumAPI.getForumStats().catch(err => {
        console.warn('Không thể tải thống kê diễn đàn:', err);
        return { data: { totalPosts: 78, totalCategories: 12 } };
      });
      promises.push(forumStatsPromise);
      
      const recentPostsPromise = forumAPI.getPosts({limit: 5}).catch(err => {
        console.warn('Không thể tải bài viết gần đây:', err);
        return { data: { data: [] } };
      });
      promises.push(recentPostsPromise);

      const [studentStatsResponse, forumStatsResponse, recentPostsResponse] = await Promise.all(promises);
      
      studentStats = studentStatsResponse.data.data || studentStatsResponse.data;
      forumStats = forumStatsResponse.data;
      recentPosts = recentPostsResponse.data.data || [];
      
      console.log('Recent posts response:', recentPostsResponse);
      
      setStatistics({
        studentCount: studentStats.totalStudents || 145,
        postCount: forumStats.totalPosts || 78,
        courseCount: forumStats.totalCategories || 12, 
        assignmentCount: studentStats.totalAssignments || 45,
        newStudentsThisMonth: studentStats.newStudentsThisMonth || 12,
        activeStudents: studentStats.activeStudents || 128,
        recentPosts: recentPosts || [],
        events: [
          { 
            title: 'Đăng ký học phần học kỳ 2 năm 2024-2025', 
            date: '15/03/2025 - 30/03/2025',
            type: 'registration'
          },
          { 
            title: 'Hội thảo "Công nghệ AI trong Giáo dục"',
            date: '25/04/2025, 14:00 - 17:00',
            type: 'event'
          },
          {
            title: 'Hạn nộp học phí kỳ 2 năm 2024-2025',
            date: '30/04/2025',
            type: 'deadline'
          }
        ]
      });

      console.log('Thống kê đã tải:', { studentStats, forumStats, recentPosts });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (authState?.token) {
      fetchStatistics();
    } else {
      setLoading(false);
    }
  }, [authState?.token]);
  
  const StatTile = ({ title, value, icon, color, loading }) => (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        bgcolor: 'background.paper',
        transition: '0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
        borderRadius: 2,
      }}
    >
      <Avatar
        sx={{
          bgcolor: color,
          width: 56,
          height: 56,
          mb: 2,
          boxShadow: 1,
        }}
      >
        {icon}
      </Avatar>
      {loading ? (
        <>
          <Skeleton variant="text" width="80%" height={40} />
          <Skeleton variant="text" width="60%" />
        </>
      ) : (
        <>
          <Typography variant="h4" component="div" gutterBottom fontWeight="bold">
            {value}
          </Typography>
          <Typography color="text.secondary" align="center">
            {title}
          </Typography>
        </>
      )}
    </Paper>
  );
  
  const stats = [
    {
      title: 'Sinh viên',
      value: statistics.studentCount,
      icon: <Group sx={{ fontSize: 32 }} />,
      color: '#2e7d32',
    },
    {
      title: 'Bài viết',
      value: statistics.postCount,
      icon: <ForumIcon sx={{ fontSize: 32 }} />,
      color: '#1976d2',
    },
    {
      title: 'Khóa học',
      value: statistics.courseCount,
      icon: <School sx={{ fontSize: 32 }} />,
      color: '#ed6c02',
    },
    {
      title: 'Bài tập',
      value: statistics.assignmentCount,
      icon: <Assignment sx={{ fontSize: 32 }} />,
      color: '#9c27b0',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="500">
          Xin chào, {authState?.user?.name || 'Sinh viên'}!
        </Typography>
        <Typography color="text.secondary" variant="subtitle1">
          Chào mừng bạn đến với Hệ thống Quản lý Sinh viên - Ngày: {new Date().toLocaleDateString('vi-VN')}
        </Typography>
        <Divider sx={{ mt: 2, mb: 3 }} />
      </Box>

      {error && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" startIcon={<Refresh />} onClick={fetchStatistics}>
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <StatTile 
              title={stat.title} 
              value={stat.value} 
              icon={stat.icon} 
              color={stat.color} 
              loading={loading} 
            />
          </Grid>
        ))}

        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Event sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="h2">
                      Sự kiện sắp tới
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  {loading ? (
                    Array.from(new Array(3)).map((_, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                        <Skeleton variant="text" width="60%" />
                      </Box>
                    ))
                  ) : (
                    <>
                      {statistics.events.map((event, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                            {event.type === 'registration' ? '🎓 ' : 
                             event.type === 'event' ? '📢 ' : 
                             event.type === 'deadline' ? '⏰ ' : ''} 
                            {event.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Thời gian: {event.date}
                          </Typography>
                          {index < statistics.events.length - 1 && <Divider sx={{ my: 2 }} />}
                        </Box>
                      ))}
                    </>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary" onClick={() => navigate('/calendar')}>
                    Xem lịch đầy đủ
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={2} sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="h2">
                      Thống kê nhanh
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  {loading ? (
                    Array.from(new Array(3)).map((_, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Skeleton variant="text" />
                        <Skeleton variant="text" width="70%" />
                      </Box>
                    ))
                  ) : (
                    <List disablePadding>
                      <ListItem sx={{ pb: 1, pt: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#4caf50', width: 36, height: 36 }}>
                            <PostAdd fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={<Typography variant="body1">{statistics.newStudentsThisMonth} sinh viên mới</Typography>} 
                          secondary="Tháng này" 
                        />
                      </ListItem>
                      
                      <ListItem sx={{ py: 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#2196f3', width: 36, height: 36 }}>
                            <Group fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={<Typography variant="body1">{statistics.activeStudents} sinh viên đang hoạt động</Typography>} 
                          secondary="Đang học" 
                        />
                      </ListItem>
                      
                      <ListItem sx={{ py: 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#ff9800', width: 36, height: 36 }}>
                            <ForumIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={<Typography variant="body1">{statistics.recentPosts.length} bài viết mới</Typography>} 
                          secondary="Gần đây" 
                        />
                      </ListItem>
                    </List>
                  )}
                </CardContent>
                
                <Box sx={{ flexGrow: 1 }} />
                
                <CardActions>
                  <Button size="small" color="primary" onClick={() => navigate('/admin-dashboard')}>
                    Xem chi tiết thống kê
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Grid>
        
        <Grid item xs={12}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ForumIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2">
                  Bài viết mới nhất
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {loading ? (
                Array.from(new Array(5)).map((_, index) => (
                  <Box key={index} sx={{ display: 'flex', mb: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                    <Box sx={{ width: '100%' }}>
                      <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                      <Skeleton variant="text" width="60%" />
                    </Box>
                  </Box>
                ))
              ) : statistics.recentPosts.length > 0 ? (
                <List disablePadding>
                  {statistics.recentPosts.map((post) => (
                    <React.Fragment key={post?._id || Math.random()}>
                      <ListItem 
                        button 
                        onClick={() => navigate(`/forum/post/${post._id}`)} 
                        sx={{ borderRadius: 1, '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}
                      >
                        <ListItemAvatar>
                          <Avatar src={post.author?.avatar || null}>
                            {post.author?.name?.charAt(0) || 'U'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={post.title}
                          secondary={
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {post.author?.name} • {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay'}
                            </Typography>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 2 }}>
                  Chưa có bài viết nào
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button size="small" color="primary" onClick={() => navigate('/forum')}>
                Xem tất cả bài viết
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;