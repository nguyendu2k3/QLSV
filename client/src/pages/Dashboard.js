import React, { useState, useEffect } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  TrendingUp,
  PeopleAlt,
  School,
  MenuBook,
  MoreVert,
  AddCircle,
  CheckCircle,
  Person,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { courseAPI, studentAPI } from '../utils/api';

// Dữ liệu mẫu khi API không hoạt động
const sampleData = {
  totalStudents: 1234,
  totalCourses: 156,
  newStudentsThisMonth: 124,
  activeStudents: 1050,
  graduatedStudents: 184,
  coursesByStatus: { active: 95, inactive: 20, completed: 41 },
  coursesByDepartment: { 'Công nghệ thông tin': 45, 'Kinh tế': 35, 'Ngoại ngữ': 25, 'Kỹ thuật': 30, 'Khác': 21 },
  registrationsByStatus: { pending: 120, approved: 850, completed: 200, rejected: 30 },
  myRegisteredCourses: 8,
  progressData: {
    completedCourses: 5,
    pendingCourses: 3,
    totalRegistered: 8,
  },
};

const sampleCourses = [
  {
    _id: '1',
    courseCode: 'CNTT001',
    name: 'Lập trình Java',
    credits: 4,
    department: 'Công nghệ thông tin',
    enrolledStudents: 35,
    maxStudents: 50,
    semester: 'Học kỳ 1 2024-2025',
    description: 'Giới thiệu về ngôn ngữ lập trình Java và các ứng dụng của nó.',
  },
  {
    _id: '2',
    courseCode: 'CNTT002',
    name: 'Cơ sở dữ liệu',
    credits: 3,
    department: 'Công nghệ thông tin',
    enrolledStudents: 42,
    maxStudents: 45,
    semester: 'Học kỳ 1 2024-2025',
    description: 'Học về thiết kế và quản lý cơ sở dữ liệu.',
  },
  {
    _id: '3',
    courseCode: 'CNTT003',
    name: 'Hệ điều hành',
    credits: 3,
    department: 'Công nghệ thông tin',
    enrolledStudents: 28,
    maxStudents: 50,
    semester: 'Học kỳ 1 2024-2025',
    description: 'Tìm hiểu về nguyên lý hoạt động của hệ điều hành.',
  },
  {
    _id: '4',
    courseCode: 'CNTT004',
    name: 'Mạng máy tính',
    credits: 3,
    department: 'Công nghệ thông tin',
    enrolledStudents: 30,
    maxStudents: 45,
    semester: 'Học kỳ 2 2024-2025',
    description: 'Kiến thức về mạng máy tính và truyền thông.',
  },
  {
    _id: '5',
    courseCode: 'CNTT005',
    name: 'Lập trình Web',
    credits: 4,
    department: 'Công nghệ thông tin',
    enrolledStudents: 38,
    maxStudents: 40,
    semester: 'Học kỳ 2 2024-2025',
    description: 'Học về phát triển ứng dụng web với HTML, CSS, JavaScript.',
  },
];

const sampleRegisteredCourses = [
  {
    _id: '1',
    course: {
      _id: '1',
      courseCode: 'CNTT001',
      name: 'Lập trình Java',
      credits: 4,
      instructor: { name: 'Nguyễn Văn A' },
    },
    status: 'approved',
    grade: { average: 8.5 },
  },
  {
    _id: '2',
    course: {
      _id: '2',
      courseCode: 'CNTT002',
      name: 'Cơ sở dữ liệu',
      credits: 3,
      instructor: { name: 'Trần Thị B' },
    },
    status: 'completed',
    grade: { average: 9.0 },
  },
  {
    _id: '3',
    course: {
      _id: '3',
      courseCode: 'CNTT003',
      name: 'Hệ điều hành',
      credits: 3,
      instructor: { name: 'Lê Văn C' },
    },
    status: 'pending',
    grade: { average: null },
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [openCourseDialog, setOpenCourseDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [currentSemester, setCurrentSemester] = useState('Học kỳ 1 2024-2025');
  const [availableSemesters, setAvailableSemesters] = useState(['Tất cả', 'Học kỳ 1 2024-2025', 'Học kỳ 2 2024-2025']);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [useSampleData, setUseSampleData] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        let statsData;
        let tempCourseStats = null;

        try {
          if (isStudent) {
            const courseStatsResponse = await courseAPI.getCourseStats();
            const myCoursesResponse = await courseAPI.getMyRegisteredCourses();
            tempCourseStats = courseStatsResponse;

            statsData = {
              totalCourses: courseStatsResponse.data.data.totalCourses,
              myRegisteredCourses: myCoursesResponse.data.count,
              coursesByStatus: courseStatsResponse.data.data.coursesByStatus,
              coursesByDepartment: courseStatsResponse.data.data.coursesByDepartment,
              registrationsByStatus: courseStatsResponse.data.data.registrationsByStatus,
              progressData: {
                completedCourses: (myCoursesResponse.data.data || []).filter((r) => r.status === 'completed').length,
                pendingCourses: (myCoursesResponse.data.data || []).filter((r) =>
                  ['pending', 'approved'].includes(r.status)
                ).length,
                totalRegistered: myCoursesResponse.data.count,
              },
            };
          } else {
            const studentStatsResponse = await studentAPI.getStudentStats();
            const courseStatsResponse = await courseAPI.getCourseStats();
            tempCourseStats = courseStatsResponse;

            statsData = {
              ...studentStatsResponse.data.data,
              ...courseStatsResponse.data.data,
            };
          }

          setUseSampleData(false);
        } catch (error) {
          console.warn('API không khả dụng, sử dụng dữ liệu mẫu', error);
          setUseSampleData(true);
          statsData = sampleData;
          setCourses(sampleCourses);
          if (isStudent) {
            setMyCourses(sampleRegisteredCourses);
          }
        }

        setStats(statsData);

        if (!useSampleData && tempCourseStats?.data?.data?.topCourses) {
          const uniqueSemesters = Array.from(
            new Set(
              tempCourseStats.data.data.topCourses
                .filter((course) => course.semester)
                .map((course) => course.semester)
            )
          );

          if (uniqueSemesters.length > 0) {
            setAvailableSemesters(['Tất cả', ...uniqueSemesters]);
            setCurrentSemester(uniqueSemesters[0] || 'Học kỳ 1 2024-2025');
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Có lỗi khi tải dữ liệu, vui lòng thử lại sau');
        setUseSampleData(true);
        setStats(sampleData);
        setCourses(sampleCourses);
        if (isStudent) {
          setMyCourses(sampleRegisteredCourses);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isStudent]);

  useEffect(() => {
    if (useSampleData) return;

    const fetchCourses = async () => {
      try {
        const filters = {
          status: 'active',
          semester: currentSemester !== 'Tất cả' ? currentSemester : undefined,
        };

        const response = await courseAPI.getAllCourses(filters);
        setCourses(response.data.data || []);

        if (isStudent) {
          const myCoursesResponse = await courseAPI.getMyRegisteredCourses(filters);
          setMyCourses(myCoursesResponse.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setCourses(sampleCourses);
        if (isStudent) {
          setMyCourses(sampleRegisteredCourses);
        }

        setSnackbar({
          open: true,
          message: 'Có lỗi khi tải danh sách khóa học, hiển thị dữ liệu mẫu',
          severity: 'warning',
        });
      }
    };

    fetchCourses();
  }, [isStudent, currentSemester, useSampleData]);

  const generateChartData = () => {
    if (!stats) return {};

    const monthlyData = [
      { month: '01', students: 750, graduated: 150 },
      { month: '02', students: 800, graduated: 160 },
      { month: '03', students: 850, graduated: 170 },
      { month: '04', students: 900, graduated: 180 },
      { month: '05', students: 950, graduated: 190 },
      { month: '06', students: 1000, graduated: 200 },
    ];

    const courseStatusData = stats.coursesByStatus
      ? Object.entries(stats.coursesByStatus).map(([status, count]) => ({
          name: status === 'active' ? 'Đang mở' : status === 'completed' ? 'Đã kết thúc' : 'Không hoạt động',
          value: count,
        }))
      : [];

    return {
      monthlyData,
      courseStatusData,
    };
  };

  const handleRegisterCourse = async (courseId) => {
    try {
      setRegistering(true);

      if (useSampleData) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const selectedCourse = courses.find((course) => course._id === courseId);
        const newRegistration = {
          _id: Date.now().toString(),
          course: selectedCourse,
          status: 'pending',
          grade: { average: null },
        };
        setMyCourses([...myCourses, newRegistration]);
        setSnackbar({
          open: true,
          message: 'Đăng ký khóa học thành công (dữ liệu mẫu)',
          severity: 'success',
        });
        setOpenCourseDialog(false);
        return;
      }

      await courseAPI.registerCourse(courseId);

      setSnackbar({
        open: true,
        message: 'Đăng ký khóa học thành công',
        severity: 'success',
      });

      const myCoursesResponse = await courseAPI.getMyRegisteredCourses();
      setMyCourses(myCoursesResponse.data.data || []);

      setOpenCourseDialog(false);
    } catch (err) {
      console.error('Error registering course:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Có lỗi khi đăng ký khóa học',
        severity: 'error',
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregisterCourse = async (courseId) => {
    try {
      setRegistering(true);

      if (useSampleData) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setMyCourses(myCourses.filter((reg) => reg.course._id !== courseId));
        setSnackbar({
          open: true,
          message: 'Hủy đăng ký khóa học thành công (dữ liệu mẫu)',
          severity: 'success',
        });
        return;
      }

      await courseAPI.unregisterCourse(courseId);

      setSnackbar({
        open: true,
        message: 'Hủy đăng ký khóa học thành công',
        severity: 'success',
      });

      const myCoursesResponse = await courseAPI.getMyRegisteredCourses();
      setMyCourses(myCoursesResponse.data.data || []);
    } catch (err) {
      console.error('Error unregistering course:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Có lỗi khi hủy đăng ký khóa học',
        severity: 'error',
      });
    } finally {
      setRegistering(false);
    }
  };

  const isRegistered = (courseId) => {
    return myCourses.some((registration) => registration.course._id === courseId);
  };

  const getCourseRegistrationStatus = (courseId) => {
    const registration = myCourses.find((reg) => reg.course._id === courseId);
    return registration ? registration.status : null;
  };

  const renderOverviewStats = () => {
    if (!stats) return null;

    const overviewData = isStudent
      ? [
          {
            title: 'Khóa học đã đăng ký',
            value: stats.myRegisteredCourses || 0,
            icon: <MenuBook />,
            color: '#1976d2',
          },
          {
            title: 'Khóa học đã hoàn thành',
            value: stats.progressData?.completedCourses || 0,
            icon: <CheckCircle />,
            color: '#2e7d32',
          },
          {
            title: 'Khóa học đang học',
            value: stats.progressData?.pendingCourses || 0,
            icon: <School />,
            color: '#ed6c02',
          },
          {
            title: 'Tiến độ học tập',
            value:
              stats.progressData?.completedCourses > 0
                ? `${Math.round((stats.progressData.completedCourses / (stats.totalCourses || 1)) * 100)}%`
                : '0%',
            icon: <TrendingUp />,
            color: '#9c27b0',
          },
        ]
      : [
          {
            title: 'Tổng sinh viên',
            value: stats.totalStudents || 0,
            icon: <PeopleAlt />,
            color: '#1976d2',
          },
          {
            title: 'Môn học',
            value: stats.totalCourses || 0,
            icon: <MenuBook />,
            color: '#2e7d32',
          },
          {
            title: 'Sinh viên mới (tháng)',
            value: stats.newStudentsThisMonth || 0,
            icon: <Person />,
            color: '#ed6c02',
          },
          {
            title: 'Tỷ lệ học tập',
            value: stats.activeStudents
              ? `${Math.round((stats.activeStudents / (stats.totalStudents || 1)) * 100)}%`
              : '0%',
            icon: <TrendingUp />,
            color: '#9c27b0',
          },
        ];

    return (
      <>
        {overviewData.map((stat) => (
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
      </>
    );
  };

  const renderCharts = () => {
    const chartData = generateChartData();
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a83232'];

    return (
      <>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Thống kê sinh viên theo tháng
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={chartData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#1976d2" name="Sinh viên" />
                <Bar dataKey="graduated" fill="#2e7d32" name="Tốt nghiệp" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Trạng thái khóa học
            </Typography>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.courseStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.courseStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </>
    );
  };

  const renderAvailableCourses = () => {
    return (
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Khóa học có thể đăng ký</Typography>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="semester-select-label">Học kỳ</InputLabel>
              <Select
                labelId="semester-select-label"
                value={currentSemester}
                label="Học kỳ"
                onChange={(e) => setCurrentSemester(e.target.value)}
              >
                {availableSemesters.map((semester) => (
                  <MenuItem key={semester} value={semester}>
                    {semester}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã môn học</TableCell>
                  <TableCell>Tên môn học</TableCell>
                  <TableCell>Tín chỉ</TableCell>
                  <TableCell>Khoa/Bộ môn</TableCell>
                  <TableCell>Sĩ số</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.length > 0 ? (
                  courses.map((course) => {
                    const alreadyRegistered = isRegistered(course._id);
                    const registrationStatus = getCourseRegistrationStatus(course._id);

                    return (
                      <TableRow key={course._id}>
                        <TableCell>{course.courseCode}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {course.name}
                          </Typography>
                        </TableCell>
                        <TableCell>{course.credits}</TableCell>
                        <TableCell>{course.department}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={(course.enrolledStudents / course.maxStudents) * 100}
                              sx={{ flexGrow: 1 }}
                            />
                            <Typography variant="body2">
                              {course.enrolledStudents}/{course.maxStudents}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {isStudent && (
                            alreadyRegistered ? (
                              <Box>
                                <Chip
                                  label={
                                    registrationStatus === 'approved'
                                      ? 'Đã duyệt'
                                      : registrationStatus === 'completed'
                                      ? 'Đã hoàn thành'
                                      : registrationStatus === 'rejected'
                                      ? 'Đã từ chối'
                                      : 'Chờ duyệt'
                                  }
                                  color={
                                    registrationStatus === 'approved' || registrationStatus === 'completed'
                                      ? 'success'
                                      : registrationStatus === 'rejected'
                                      ? 'error'
                                      : 'warning'
                                  }
                                  sx={{ mr: 1 }}
                                />
                                {(registrationStatus === 'pending' || registrationStatus === 'approved') && (
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => handleUnregisterCourse(course._id)}
                                    disabled={registering}
                                  >
                                    Hủy
                                  </Button>
                                )}
                              </Box>
                            ) : (
                              <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddCircle />}
                                disabled={course.enrolledStudents >= course.maxStudents || registering}
                                onClick={() => {
                                  setSelectedCourse(course);
                                  setOpenCourseDialog(true);
                                }}
                              >
                                Đăng ký
                              </Button>
                            )
                          )}
                          {!isStudent && <IconButton size="small">{<MoreVert />}</IconButton>}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Không có khóa học nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    );
  };

  const renderRegisteredCourses = () => {
    if (!isStudent) return null;

    return (
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Khóa học đã đăng ký
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã môn học</TableCell>
                  <TableCell>Tên môn học</TableCell>
                  <TableCell>Tín chỉ</TableCell>
                  <TableCell>Giảng viên</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Điểm TB</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myCourses.length > 0 ? (
                  myCourses.map((registration) => (
                    <TableRow key={registration._id}>
                      <TableCell>{registration.course.courseCode}</TableCell>
                      <TableCell>{registration.course.name}</TableCell>
                      <TableCell>{registration.course.credits}</TableCell>
                      <TableCell>{registration.course.instructor?.name || 'Chưa phân công'}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            registration.status === 'pending'
                              ? 'Chờ duyệt'
                              : registration.status === 'approved'
                              ? 'Đã duyệt'
                              : registration.status === 'completed'
                              ? 'Đã hoàn thành'
                              : registration.status === 'rejected'
                              ? 'Đã từ chối'
                              : registration.status
                          }
                          color={
                            registration.status === 'approved' || registration.status === 'completed'
                              ? 'success'
                              : registration.status === 'rejected'
                              ? 'error'
                              : 'warning'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {registration.grade && registration.grade.average
                          ? registration.grade.average.toFixed(1)
                          : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {['pending', 'approved'].includes(registration.status) && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleUnregisterCourse(registration.course._id)}
                            disabled={registering}
                          >
                            Hủy
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Bạn chưa đăng ký khóa học nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    );
  };

  const renderCourseDialog = () => {
    if (!selectedCourse) return null;

    return (
      <Dialog open={openCourseDialog} onClose={() => !registering && setOpenCourseDialog(false)}>
        <DialogTitle>Đăng ký khóa học</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Xác nhận đăng ký khóa học:</Typography>

            <Typography variant="body1" fontWeight="bold">
              {selectedCourse.name} ({selectedCourse.courseCode})
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              - Số tín chỉ: {selectedCourse.credits}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              - Khoa/Bộ môn: {selectedCourse.department}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              - Học kỳ: {selectedCourse.semester}
            </Typography>

            {selectedCourse.description && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {selectedCourse.description}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => !registering && setOpenCourseDialog(false)} disabled={registering}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={() => handleRegisterCourse(selectedCourse._id)}
            disabled={registering}
            startIcon={registering ? <CircularProgress size={20} /> : null}
          >
            {registering ? 'Đang xử lý...' : 'Xác nhận đăng ký'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderStudentTabs = () => {
    if (!isStudent) return null;

    return (
      <Grid item xs={12}>
        <Paper sx={{ mb: 2 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} variant="fullWidth">
            <Tab label="Tổng quan" />
            <Tab label="Đăng ký môn học" />
            <Tab label="Khóa học của tôi" />
          </Tabs>
        </Paper>
      </Grid>
    );
  };

  const renderTabContent = () => {
    if (!isStudent) {
      return (
        <>
          {renderOverviewStats()}
          {renderCharts()}
          {renderAvailableCourses()}
        </>
      );
    }

    switch (tabValue) {
      case 0:
        return (
          <>
            {renderOverviewStats()}
            {renderCharts()}
          </>
        );
      case 1:
        return renderAvailableCourses();
      case 2:
        return renderRegisteredCourses();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {renderStudentTabs()}
        {renderTabContent()}
      </Grid>

      {renderCourseDialog()}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;