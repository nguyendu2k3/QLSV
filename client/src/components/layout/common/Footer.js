import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  IconButton,
  Paper,
  Stack
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  GitHub,
  Email,
  Phone,
  LocationOn,
  School
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Thông tin',
      links: [
        { name: 'Giới thiệu', url: '/about' },
        { name: 'Liên hệ', url: '/contact' },
        { name: 'Điều khoản sử dụng', url: '/terms' },
        { name: 'Chính sách bảo mật', url: '/privacy' },
      ]
    },
    {
      title: 'Hỗ trợ',
      links: [
        { name: 'Trợ giúp', url: '/help' },
        { name: 'FAQ', url: '/faq' },
        { name: 'Báo lỗi', url: '/report-bug' },
        { name: 'Phản hồi', url: '/feedback' },
      ]
    },
    {
      title: 'Liên kết',
      links: [
        { name: 'Trang chủ', url: '/' },
        { name: 'Diễn đàn', url: '/forum' },
        { name: 'Tài liệu', url: '/documents' },
        { name: 'Dashboard', url: '/dashboard' },
      ]
    }
  ];

  const socialLinks = [
    { icon: <Facebook />, url: 'https://facebook.com', name: 'Facebook' },
    { icon: <Twitter />, url: 'https://twitter.com', name: 'Twitter' },
    { icon: <Instagram />, url: 'https://instagram.com', name: 'Instagram' },
    { icon: <LinkedIn />, url: 'https://linkedin.com', name: 'LinkedIn' },
    { icon: <GitHub />, url: 'https://github.com', name: 'GitHub' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: 'auto', // Push to the bottom if there's not enough content
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo and Description */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <School sx={{ color: 'primary.main', fontSize: 36, mr: 1 }} />
              <Typography variant="h5" fontWeight="bold" color="text.primary">
                Quản Lý Sinh Viên
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Hệ thống quản lý sinh viên toàn diện, cung cấp các công cụ hiện đại giúp
              sinh viên và giảng viên tương tác hiệu quả, quản lý tài liệu học tập và theo dõi
              tiến trình học tập một cách thuận tiện.
            </Typography>
            
            <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
              {socialLinks.map((social, index) => (
                <IconButton 
                  key={index} 
                  component="a" 
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  color="primary"
                  aria-label={social.name}
                  sx={{ 
                    '&:hover': { 
                      bgcolor: 'rgba(37, 99, 235, 0.08)',
                    } 
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>
          
          {/* Footer Links */}
          {footerLinks.map((section, index) => (
            <Grid item xs={12} sm={6} md={2} lg={2} key={index}>
              <Typography 
                variant="subtitle1" 
                color="text.primary" 
                fontWeight="bold"
                sx={{ mb: 2 }}
              >
                {section.title}
              </Typography>
              <Stack spacing={1.5}>
                {section.links.map((link, idx) => (
                  <Link
                    key={idx}
                    component={RouterLink}
                    to={link.url}
                    color="text.secondary"
                    sx={{ 
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={4} lg={4}>
            <Typography 
              variant="subtitle1" 
              color="text.primary" 
              fontWeight="bold"
              sx={{ mb: 2 }}
            >
              Liên hệ với chúng tôi
            </Typography>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: 'background.default',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <LocationOn fontSize="small" color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  254 Nguyễn Văn Linh, Đà Nẵng
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Email fontSize="small" color="primary" sx={{ mr: 1 }} />
                <Link 
                  href="mailto:contact@qlsv.edu.vn" 
                  color="text.secondary"
                  sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  <Typography variant="body2">
                    contact@qlsv.edu.vn
                  </Typography>
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Phone fontSize="small" color="primary" sx={{ mr: 1 }} />
                <Link 
                  href="tel:+84123456789" 
                  color="text.secondary"
                  sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  <Typography variant="body2">
                    +84 123 456 789
                  </Typography>
                </Link>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4 }} />
        
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'center' },
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {year} Quản Lý Sinh Viên. Tất cả các quyền đã được bảo hộ.
          </Typography>
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 3, 
              mt: { xs: 2, sm: 0 } 
            }}
          >
            <Link 
              component={RouterLink}
              to="/terms"
              color="text.secondary"
              sx={{ 
                fontSize: '0.875rem',
                textDecoration: 'none', 
                '&:hover': { color: 'primary.main' } 
              }}
            >
              Điều khoản
            </Link>
            <Link 
              component={RouterLink}
              to="/privacy"
              color="text.secondary"
              sx={{ 
                fontSize: '0.875rem',
                textDecoration: 'none', 
                '&:hover': { color: 'primary.main' } 
              }}
            >
              Bảo mật
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;