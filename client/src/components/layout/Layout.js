import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Button,
  useTheme,
  useMediaQuery,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Forum as ForumIcon,
  Dashboard,
  Person,
  Logout,
  ChevronLeft,
  School,
  AccountBox,
  Settings,
  BookmarkBorder,
  Help,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl } from '../../utils/api';
import Footer from './common/Footer';

const drawerWidth = 240;

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';

  // Close drawer when screen size changes or navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [isMobile, location.pathname]);

  const menuItems = [
    { text: 'Trang Chủ', icon: <Home />, path: '/' },
    { text: 'Diễn Đàn', icon: <ForumIcon />, path: '/forum' },
    { text: 'Tài Liệu', icon: <BookmarkBorder />, path: '/documents' },
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    ...(isAdmin ? [{ text: 'Quản Lý', icon: <AdminPanelSettings />, path: '/admin-dashboard' }] : []),
  ];

  const secondaryMenuItems = [
    { text: 'Thông Tin Cá Nhân', icon: <AccountBox />, path: '/profile' },
    { text: 'Cài Đặt', icon: <Settings />, path: '/settings' },
    { text: 'Trợ Giúp', icon: <Help />, path: '/help' },
  ];

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseMenu();
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Trang Chủ';
    if (path === '/forum') return 'Diễn Đàn';
    if (path.includes('/forum/post/')) return 'Chi Tiết Bài Viết';
    if (path.includes('/forum/edit/')) return 'Chỉnh Sửa Bài Viết';
    if (path === '/profile') return 'Thông Tin Cá Nhân';
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/documents') return 'Tài Liệu';
    if (path === '/settings') return 'Cài Đặt';
    if (path === '/help') return 'Trợ Giúp';
    if (path === '/admin-dashboard') return 'Quản Lý Sinh Viên';
    return 'Quản Lý Sinh Viên';
  };

  const drawer = (
    <>
      {/* Drawer Header */}
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: [1],
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <School sx={{ fontSize: 24, mr: 1 }} />
          <Typography variant="h6" noWrap fontWeight="bold">
            Quản Lý Sinh Viên
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
            <ChevronLeft />
          </IconButton>
        )}
      </Toolbar>
      <Divider />

      {/* Main Menu */}
      <List component="nav" sx={{ px: 1, py: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1,
                py: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  }
                },
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: location.pathname === item.path ? 'inherit' : 'text.secondary',
                  minWidth: 40
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 1 }} />

      {/* Secondary Menu */}
      <List component="nav" sx={{ px: 1, py: 1 }}>
        {secondaryMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1,
                py: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  }
                },
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: location.pathname === item.path ? 'inherit' : 'text.secondary',
                  minWidth: 40
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* User Profile Section */}
      {user && (
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Avatar
              alt={user?.name}
              src={getAvatarUrl(user?.avatar)}
              sx={{ width: 40, height: 40, bgcolor: 'secondary.main' }}
            >
              {user?.name?.charAt(0)}
            </Avatar>
            <Box sx={{ ml: 2, overflow: 'hidden' }}>
              <Typography variant="subtitle2" noWrap fontWeight="bold">
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {user?.email}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && !isMobile && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Container maxWidth={false}>
          <Toolbar>
            {/* Menu Icon */}
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, ...(open && !isMobile && { display: 'none' }) }}
            >
              <MenuIcon />
            </IconButton>

            {/* Title */}
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              {getPageTitle()}
            </Typography>
            
            {/* User Menu */}
            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {/* User Avatar */}
                <Box>
                  <Tooltip title="Tài khoản">
                    <IconButton
                      onClick={handleProfileMenu}
                      size="small"
                      sx={{ 
                        ml: 1,
                        border: Boolean(anchorEl) ? '2px solid' : '0px solid',
                        borderColor: 'primary.main'
                      }}
                    >
                      <Avatar
                        alt={user?.name}
                        src={getAvatarUrl(user?.avatar)}
                        sx={{ width: 35, height: 35, bgcolor: 'secondary.main' }}
                      >
                        {user?.name?.charAt(0)}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* User Menu */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                  onClick={handleCloseMenu}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      minWidth: 200,
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={() => navigate('/profile')}>
                    <ListItemIcon>
                      <Person fontSize="small" />
                    </ListItemIcon>
                    Thông tin cá nhân
                  </MenuItem>
                  <MenuItem onClick={() => navigate('/settings')}>
                    <ListItemIcon>
                      <Settings fontSize="small" />
                    </ListItemIcon>
                    Cài đặt
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    Đăng xuất
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box>
                <Button 
                  variant="text" 
                  onClick={() => navigate('/login')}
                  sx={{ fontWeight: 'medium' }}
                >
                  Đăng nhập
                </Button>
                <Button 
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/register')}
                  sx={{ 
                    ml: 1,
                    display: { xs: 'none', sm: 'inline-flex' },
                    fontWeight: 'medium'
                  }}
                >
                  Đăng ký
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${open && !isMobile ? drawerWidth : 0}px)` },
          ml: { sm: open && !isMobile ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Toolbar /> {/* Spacing to push content below app bar */}
        <Box
          sx={{
            flexGrow: 1,
            pt: 2,
            pb: 4,
            animation: 'fadeIn 0.3s ease-in-out',
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(20px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;