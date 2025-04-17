import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl } from '../../utils/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Quản Lý Sinh Viên
        </Typography>

        {user ? (
          <>
            <Button color="inherit" onClick={() => navigate('/')}>
              Trang Chủ
            </Button>
            <Button color="inherit" onClick={() => navigate('/forum')}>
              Diễn Đàn
            </Button>
            <IconButton onClick={handleMenu} color="inherit">
              <Avatar 
                src={getAvatarUrl(user.avatar)} 
                alt={user.name}
                sx={{ bgcolor: 'secondary.main' }}
              >
                {user.name?.charAt(0)}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => {
                handleClose();
                navigate('/profile');
              }}>
                Thông Tin Cá Nhân
              </MenuItem>
              <MenuItem onClick={handleLogout}>Đăng Xuất</MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Đăng Nhập
            </Button>
            <Button color="inherit" onClick={() => navigate('/register')}>
              Đăng Ký
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;