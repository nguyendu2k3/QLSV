import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" color="primary" sx={{ mb: 2, fontSize: '6rem' }}>
          404
        </Typography>
        <Typography variant="h4" gutterBottom>
          Trang không tồn tại
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </Typography>
        <Button
          variant="contained"
          startIcon={<Home />}
          onClick={() => navigate('/')}
        >
          Về trang chủ
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;