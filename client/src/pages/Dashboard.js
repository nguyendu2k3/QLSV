import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import {
  TrendingUp,
  PeopleAlt,
  School,
  MenuBook,
  MoreVert,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  // Dữ liệu mẫu cho biểu đồ
  const chartData = [
    { month: '01', students: 750, graduated: 150 },
    { month: '02', students: 800, graduated: 160 },
    { month: '03', students: 850, graduated: 170 },
    { month: '04', students: 900, graduated: 180 },
    { month: '05', students: 950, graduated: 190 },
    { month: '06', students: 1000, graduated: 200 },
  ];

  // Dữ liệu mẫu cho bảng sinh viên
  const students = [
    {
      id: 1,
      name: 'Nguyễn Du',
      studentId: 'SV001',
      major: 'Công nghệ thông tin',
      status: 'active',
      avatar: null,
      progress: 85,
    },
    {
      id: 2,
      name: 'Trần Thanh',
      studentId: 'SV002',
      major: 'Kỹ thuật phần mềm',
      status: 'active',
      avatar: null,
      progress: 92,
    },
    {
      id: 3,
      name: 'Lê Hồng',
      studentId: 'SV003',
      major: 'An toàn thông tin',
      status: 'inactive',
      avatar: null,
      progress: 78,
    },
  ];

  // Thống kê tổng quan
  const stats = [
    {
      title: 'Tổng sinh viên',
      value: '1,234',
      icon: <PeopleAlt />,
      color: '#1976d2',
    },
    {
      title: 'Khoa/Ngành',
      value: '15',
      icon: <School />,
      color: '#2e7d32',
    },
    {
      title: 'Môn học',
      value: '156',
      icon: <MenuBook />,
      color: '#ed6c02',
    },
    {
      title: 'Tỷ lệ tốt nghiệp',
      value: '92%',
      icon: <TrendingUp />,
      color: '#9c27b0',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        {/* Thống kê tổng quan */}
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                height: '100%',
              }}
            >
              <Avatar
                sx={{
                  bgcolor: stat.color,
                  width: 56,
                  height: 56,
                }}
              >
                {stat.icon}
              </Avatar>
              <Box>
                <Typography variant="h4" component="div">
                  {stat.value}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {stat.title}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}

        {/* Biểu đồ thống kê */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Thống kê sinh viên theo tháng
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#1976d2" name="Sinh viên" />
                <Bar dataKey="graduated" fill="#2e7d32" name="Tốt nghiệp" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Thông tin nhanh */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thông tin nhanh
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Sinh viên mới trong tháng
                </Typography>
                <Typography variant="h4">+124</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={75} 
                  sx={{ mt: 1 }} 
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Tỷ lệ đậu kỳ này
                </Typography>
                <Typography variant="h4">89%</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={89} 
                  sx={{ mt: 1 }} 
                  color="success" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Bảng danh sách sinh viên */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sinh viên</TableCell>
                  <TableCell>Mã SV</TableCell>
                  <TableCell>Ngành</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Tiến độ</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={student.avatar}>
                          {student.name.charAt(0)}
                        </Avatar>
                        <Typography>{student.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{student.studentId}</TableCell>
                    <TableCell>{student.major}</TableCell>
                    <TableCell>
                      <Chip
                        label={student.status === 'active' ? 'Đang học' : 'Bảo lưu'}
                        color={student.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={student.progress}
                          sx={{ flexGrow: 1 }}
                        />
                        <Typography variant="body2">
                          {student.progress}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small">
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;