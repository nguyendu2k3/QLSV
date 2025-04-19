import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Container,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Forum as ForumIcon,
  Person,
  Logout,
  School,
  AdminPanelSettings,
  BookmarkBorder,
  LightMode,
  DarkMode,
  Dashboard,
  AccountCircle,
  Settings,
  ChevronLeft,
} from '@mui/icons-material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl } from '../../utils/api';

const Navbar = () => {
  const { authState, logout } = useAuth();
  const user = authState.user;
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [darkMode, setDarkMode] = useState(false);
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';

  const menuItems = [
    { text: 'Trang Chủ', icon: <Home />, path: '/' },
    { text: 'Diễn Đàn', icon: <ForumIcon />, path: '/forum' },
    { text: 'Tài Liệu', icon: <BookmarkBorder />, path: '/documents' },
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    ...(isAdmin ? [{ text: 'Quản Lý', icon: <AdminPanelSettings />, path: '/admin-dashboard' }] : []),
  ];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleCloseMenu();
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Implement actual dark mode logic here
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2,
          bgcolor: theme.palette.primary.main,
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <School sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            Quản Lý SV
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
          <ChevronLeft />
        </IconButton>
      </Box>
      
      <Divider />
      
      {/* User Profile Section if logged in */}
      {user && (
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Avatar 
              src={getAvatarUrl(user.avatar)} 
              alt={user.name}
              sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: theme.palette.secondary.main 
              }}
            >
              {user.name?.charAt(0)}
            </Avatar>
            <Box sx={{ ml: 2, overflow: 'hidden' }}>
              <Typography variant="subtitle2" noWrap fontWeight="bold">
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {user.email}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      
      {/* Main Menu */}
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItem 
            disablePadding 
            key={item.text}
            sx={{ mb: 0.5 }}
          >
            <ListItemButton 
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
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
                }
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
      
      {/* Settings / Theme Toggle */}
      <List sx={{ px: 1 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            onClick={toggleDarkMode}
            sx={{ borderRadius: 1, py: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {darkMode ? <LightMode /> : <DarkMode />}
            </ListItemIcon>
            <ListItemText primary={darkMode ? "Chế độ sáng" : "Chế độ tối"} />
          </ListItemButton>
        </ListItem>
        
        {user && (
          <>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                onClick={() => handleNavigation('/profile')} 
                selected={location.pathname === '/profile'}
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
                  } 
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: location.pathname === '/profile' ? 'inherit' : 'text.secondary',
                    minWidth: 40
                  }}
                >
                  <AccountCircle />
                </ListItemIcon>
                <ListItemText primary="Thông tin cá nhân" />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                onClick={() => handleNavigation('/settings')}
                selected={location.pathname === '/settings'}
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
                  } 
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: location.pathname === '/settings' ? 'inherit' : 'text.secondary',
                    minWidth: 40
                  }}
                >
                  <Settings />
                </ListItemIcon>
                <ListItemText primary="Cài đặt" />
              </ListItemButton>
            </ListItem>
            
            <Divider sx={{ my: 1 }} />
            
            <ListItem disablePadding>
              <ListItemButton 
                onClick={handleLogout}
                sx={{ 
                  borderRadius: 1,
                  py: 1,
                  color: 'error.main',
                  '&:hover': { bgcolor: 'error.lighter' }
                }}
              >
                <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
                  <Logout />
                </ListItemIcon>
                <ListItemText primary="Đăng xuất" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
      
      {/* Login/Register links if not logged in */}
      {!user && (
        <Box sx={{ p: 2 }}>
          <Button
            variant="contained"
            fullWidth
            color="primary"
            onClick={() => handleNavigation('/login')}
            sx={{ mb: 1 }}
          >
            Đăng nhập
          </Button>
          <Button
            variant="outlined"
            fullWidth
            color="primary"
            onClick={() => handleNavigation('/register')}
          >
            Đăng ký
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        color="default"
        elevation={0}
        sx={{ 
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            {/* Logo */}
            <Box 
              component={RouterLink} 
              to="/" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <School sx={{ display: { xs: 'none', sm: 'flex' }, mr: 1, color: 'primary.main' }} />
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ display: { xs: 'none', sm: 'flex' }, fontWeight: 'bold' }}
              >
                Quản Lý Sinh Viên
              </Typography>
              
              {/* Mobile Logo */}
              <School sx={{ display: { xs: 'flex', sm: 'none' }, mr: 1, color: 'primary.main' }} />
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ display: { xs: 'flex', sm: 'none' }, fontWeight: 'bold' }}
              >
                QLSV
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4 }}>
              {user && menuItems.map((item) => (
                <Button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  startIcon={item.icon}
                  sx={{ 
                    my: 1, 
                    mx: 0.5,
                    px: 1.5,
                    py: 0.7,
                    color: 'text.primary',
                    position: 'relative',
                    fontWeight: 'medium',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: location.pathname === item.path ? '100%' : '0%',
                      height: '3px',
                      bottom: 0,
                      left: 0,
                      bgcolor: 'primary.main',
                      transition: 'width 0.2s ease-in-out',
                    },
                    '&:hover': {
                      bgcolor: 'transparent',
                      '&::after': {
                        width: '100%',
                      }
                    }
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
            
            {/* Spacer for mobile */}
            <Box sx={{ flexGrow: 1, display: { md: 'none' } }} />

            {/* User Actions */}
            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {/* Theme Toggle */}
                <Tooltip title={darkMode ? "Chế độ sáng" : "Chế độ tối"}>
                  <IconButton onClick={toggleDarkMode} color="inherit">
                    {darkMode ? <LightMode /> : <DarkMode />}
                  </IconButton>
                </Tooltip>
                
                {/* User Profile */}
                <Box sx={{ ml: { xs: 1, sm: 2 } }}>
                  <Tooltip title="Tài khoản">
                    <IconButton 
                      onClick={handleProfileMenu}
                      sx={{ 
                        p: 0,
                        border: Boolean(anchorEl) ? '2px solid' : 'none',
                        borderColor: 'primary.main'
                      }}
                    >
                      <Avatar 
                        src={getAvatarUrl(user.avatar)} 
                        alt={user.name}
                        sx={{ 
                          width: 35, 
                          height: 35,
                          bgcolor: theme.palette.secondary.main 
                        }}
                      >
                        {user.name?.charAt(0)}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                </Box>
                
                {/* User Menu */}
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      minWidth: 200,
                      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                    }
                  }}
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
                  <MenuItem onClick={() => {
                    handleCloseMenu();
                    navigate('/profile');
                  }}>
                    <ListItemIcon>
                      <Person fontSize="small" />
                    </ListItemIcon>
                    Thông tin cá nhân
                  </MenuItem>
                  <MenuItem onClick={() => {
                    handleCloseMenu();
                    navigate('/settings');
                  }}>
                    <ListItemIcon>
                      <Settings fontSize="small" />
                    </ListItemIcon>
                    Cài đặt
                  </MenuItem>
                  
                  {isAdmin && (
                    <MenuItem onClick={() => {
                      handleCloseMenu();
                      navigate('/admin-dashboard');
                    }}>
                      <ListItemIcon>
                        <AdminPanelSettings fontSize="small" />
                      </ListItemIcon>
                      Quản lý sinh viên
                    </MenuItem>
                  )}
                  
                  <Divider />
                  
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <Logout fontSize="small" color="error" />
                    </ListItemIcon>
                    <Typography color="error.main">Đăng xuất</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ display: 'flex' }}>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/login')}
                  sx={{ 
                    fontWeight: 'medium',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                  }}
                >
                  Đăng nhập
                </Button>
                <Button 
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/register')}
                  sx={{ 
                    ml: 1,
                    display: { xs: 'none', sm: 'block' },
                    fontWeight: 'medium',
                  }}
                >
                  Đăng ký
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;