import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Tooltip,
  IconButton,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Switch,
  Menu,
  MenuItem,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar,
  Badge,
  styled,
  alpha
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import { useThemeContext } from '../Context/ThemeContext';
import { useAuth } from '../Context/AuthContext';
import apiService from '../../untils/api';
import dayjs from 'dayjs';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import useWebSocket from '../../services/useWebSocket';
import SearchIcon from '@mui/icons-material/Search';
import { startHomeTour, startHomeTourLoggedIn } from '../Tutorial/tutorial';

interface Notification {
  id: string;
  username: string;
  title: string;
  content: string;
  createdAt: string;
  status: string;
  groupName: string | null;
}

interface ApiResponse {
  data: {
    data: {
      content: Notification[];
    };
  };
}

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}));

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(TextField)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: 25,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    '& fieldset': {
      border: 'none',
    },
  },
}));

const Header: React.FC = () => {
  const { toggleTheme, mode, setMode } = useThemeContext();
  const theme = useTheme();
  const { logout } = useAuth();
  const [username, setUsername] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [expandedNotificationId, setExpandedNotificationId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleStartTour = () => {
    if(username) {
      startHomeTourLoggedIn();
    } else {
      startHomeTour();
    }
  };

  useEffect(() => {
    const infoString = localStorage.getItem('info');
    if (infoString != null) {
      const info = JSON.parse(infoString);
      const username = info.firstName + " " + info.lastName;
      setUsername(username);
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setMode(savedTheme as 'light' | 'dark');
    }
  }, [setMode]);

  useWebSocket((notification: Notification) => {
    setNotifications((prevNotifications) => {
      const isNotificationExists = prevNotifications.some(
        (existingNotification) => existingNotification.username === notification.username
      );

      if (!isNotificationExists) {
        setUnreadCount(prev => prev + 1);
        return [notification, ...prevNotifications];
      }
      return prevNotifications;
    });
  });

  const handleToggleTheme = () => {
    toggleTheme();
    const newMode = mode === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newMode);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    fetchNotifications();
    setNotificationAnchor(event.currentTarget);
    setUnreadCount(0);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const fetchNotifications = async () => {
    try {
      const response: ApiResponse = await apiService.get('/api/v1/notifications');
      if (response.data?.data?.content) {
        setNotifications(response.data.data.content);
      }
    } catch (error) {
      console.log('Error fetching notifications:', error);
    }
  };

  const openNotifications = Boolean(notificationAnchor);
  const openMenu = Boolean(menuAnchor);

  const handleExpandNotification = (id: string) => {
    setExpandedNotificationId(id === expandedNotificationId ? null : id);
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        background: mode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
          : 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(10px)',
        zIndex: 1200,
        transition: 'all 0.3s ease',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        {/* Left Side - Logo and Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Link href="/home" passHref>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
                transition: 'transform 0.2s',
              }}
            >
              <Avatar
                src="/logo.png"
                alt="Logo"
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: 'primary.main',
                  boxShadow: 3,
                }}
              />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 700,
                  letterSpacing: '.2rem',
                  color: 'white',
                  textDecoration: 'none',
                  display: { xs: 'none', md: 'block' },
                }}
              >
                LIBHUB
              </Typography>
            </Box>
          </Link>

          <Button
            onClick={handleStartTour}
            variant="outlined"
            sx={{
              borderRadius: 20,
              color: 'white',
              borderColor: 'white',
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.1),
                borderColor: 'white',
              },
            }}
          >
            Tham quan
          </Button>
        </Box>

        {/* Center - Search Bar */}
        {/* <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          justifyContent: 'center',
          px: 2,
          maxWidth: 600
        }}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon sx={{ color: 'white' }} />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search books, authors..."
              inputProps={{ 'aria-label': 'search' }}
              sx={{
                '& .MuiInputBase-input': {
                  color: 'white',
                  '&::placeholder': {
                    color: alpha(theme.palette.common.white, 0.8),
                  },
                },
              }}
            />
          </Search>
        </Box> */}

        {/* Right Side - User Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme Toggle */}
          <Tooltip title={`Chuyển sang chế độ ${mode === 'light' ? 'tối' : 'sáng'}`}>
            <IconButton
              onClick={handleToggleTheme}
              sx={{ color: 'white' }}
            >
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          {username ? (
            <>
              {/* Notifications */}
              <Tooltip title="Thông báo">
                <IconButton
                  onClick={handleNotificationClick}
                  sx={{ color: 'white' }}
                >
                  <StyledBadge badgeContent={unreadCount} max={9}>
                    <NotificationsIcon />
                  </StyledBadge>
                </IconButton>
              </Tooltip>

              {/* Notifications Popover */}
              <Popover
                open={openNotifications}
                anchorEl={notificationAnchor}
                onClose={handleNotificationClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  sx: {
                    width: 400,
                    maxHeight: 500,
                    borderRadius: 3,
                    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.2)',
                    overflow: 'hidden',
                  },
                }}
              >
                <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                  <Typography variant="h6">Thông báo</Typography>
                </Box>
                <Box sx={{ overflow: 'auto', maxHeight: 400 }}>
                  {notifications.length > 0 ? (
                    <List>
                      {notifications.map((notification) => (
                        <React.Fragment key={notification.id}>
                          <ListItem disablePadding>
                            <ListItemButton 
                              onClick={() => handleExpandNotification(notification.id)}
                              sx={{
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                },
                              }}
                            >
                              <ListItemText
                                primary={
                                  <Typography 
                                    fontWeight={notification.status === 'UNREAD' ? 600 : 400}
                                    sx={{ 
                                      cursor: 'pointer',
                                      '&:hover': {
                                        color: 'primary.main'
                                      }
                                    }}
                                  >
                                    {notification.title}
                                  </Typography>
                                }
                                secondary={dayjs(notification.createdAt).format('DD/MM/YYYY HH:mm')}
                              />
                            </ListItemButton>
                          </ListItem>
                          {expandedNotificationId === notification.id && (
                            <Box sx={{ px: 3, py: 1, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                              <Typography variant="body2">
                                {notification.content}
                              </Typography>
                            </Box>
                          )}
                          <Divider sx={{ my: 0.5 }} />
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Chưa có thông báo nào
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Popover>

              {/* User Menu */}
              <Tooltip title="Cài đặt tài khoản">
                <IconButton
                  id="user-info"
                  onClick={handleMenuClick}
                  sx={{ p: 0, ml: 1 }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: 'secondary.main',
                      width: 40,
                      height: 40,
                      boxShadow: 2,
                    }}
                  >
                    {username?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                id="user-menu"
                anchorEl={menuAnchor}
                open={openMenu}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    width: 250,
                    borderRadius: 3,
                    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.2)',
                    overflow: 'hidden',
                    mt: 1.5,
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' , borderRadius: 3}}>
                  <Typography fontWeight={600}>{username}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Thành viên
                  </Typography>
                </Box>
                <Divider />
                <MenuItem 
                  component={Link}
                  href="/bookfavo"
                  onClick={handleMenuClose}
                  sx={{ py: 1.5 }}
                >
                  <FavoriteBorderIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
                  Yêu thích
                </MenuItem>
                <MenuItem 
                  id="info"
                  component={Link}
                  href="/borrowed-book"
                  onClick={handleMenuClose}
                  sx={{ py: 1.5 }}
                >
                  <HistoryIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
                  Sách đã mượn
                </MenuItem>
                <MenuItem 
                  id="virtual-book"
                  component={Link}
                  href="/my-bookshelf"
                  onClick={handleMenuClose}
                  sx={{ py: 1.5 }}
                >
                  <AddIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
                  Thêm sách ảo
                </MenuItem>
                <Divider />
                <MenuItem 
                  id="logout"
                  onClick={logout}
                  sx={{ py: 1.5, color: 'error.main' }}
                >
                  <LogoutIcon sx={{ mr: 1.5 }} />
                  Đăng xuất
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button 
                id="sign-up-btn" 
                variant="outlined" 
                href="/signup" 
                sx={{ 
                  borderRadius: 20,
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.1),
                    borderColor: 'white',
                  },
                }}
              >
                Sign Up
              </Button>
              <Button 
                id="sign-in-btn" 
                variant="contained" 
                href="/login" 
                sx={{ 
                  borderRadius: 20,
                  backgroundColor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.9),
                  },
                }}
              >
                Sign In
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;