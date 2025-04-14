import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  CircularProgress // Thêm CircularProgress
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api'; // Thêm import authAPI

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Thêm state loading

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Bắt đầu loading

    try {
      const response = await authAPI.login(formData);
      const { token, user } = response.data;
      login(token, user);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Đăng nhập
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Tên đăng nhập"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleInputChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mật khẩu"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <LoginIcon />}
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </Button>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Chưa có tài khoản?{' '}
                <Link href="/register" variant="body2">
                  Đăng ký ngay
                </Link>
              </Typography>
            </Box>
          </Box>

          {/* Hiển thị thông tin tài khoản demo khi chưa có backend */}
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tài khoản demo:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                1. Sinh viên: nguyendu2k3 / 123456
                <br />
                2. Admin: admin / admin123
                <br />
                3. Giảng viên: teacher / teacher123
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;