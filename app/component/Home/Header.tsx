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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import { useThemeContext } from '../Context/ThemeContext';
import { useAuth } from '../Context/AuthContext';
import apiService from '../../untils/api';
import dayjs from 'dayjs';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import useWebSocket from '../../services/useWebSocket';

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
    result: {
      content: Notification[];
    };
  };
}

const Header: React.FC = () => {
  const { toggleTheme, mode, setMode } = useThemeContext();
  const theme = useTheme();
  const { logout } = useAuth();
  const [username, setUsername] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [expandedNotificationId, setExpandedNotificationId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);


  useEffect(() => {
    const storedUsername = sessionStorage.getItem('fullname');
    setUsername(storedUsername);

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
      console.log(notification)

      if (isNotificationExists) {
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
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const fetchNotifications = async () => {
    try {
      const response: ApiResponse = await apiService.get('/api/v1/notifications/my-notifications');
      if (response.data && response.data.result && response.data.result.content) {
        setNotifications((prevNotifications) => {
          // Hợp nhất thông báo mới từ API với các thông báo hiện có
          const newNotifications = response.data.result.content;
          const mergedNotifications = [
            ...newNotifications.filter(newNotif => !prevNotifications.find(oldNotif => oldNotif.id === newNotif.id)),
            ...prevNotifications
          ];
          return mergedNotifications;
        });
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
      position="static"
      sx={{
        backgroundColor: theme.palette.background.paper,
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        zIndex: 10,
        width: '100%',
      }}
    >
      <Toolbar>
        {/* Menu Icon */}
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ marginLeft: '10px' }}
          onClick={handleMenuClick}
        >
          <MenuIcon sx={{ color: theme.palette.text.primary }} />
        </IconButton>
        <Menu
          anchorEl={menuAnchor}
          open={openMenu}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <MenuItem component={Link} href="/home" onClick={handleMenuClose}>Home</MenuItem>
          <MenuItem component={Link} href="/bookshelf" onClick={handleMenuClose}>Bookshelf</MenuItem>
          <MenuItem component={Link} href="/bookfavo" onClick={handleMenuClose}>Favorite</MenuItem>
          <MenuItem component={Link} href="/borrowed-book" onClick={handleMenuClose}>Borrowed Books</MenuItem>
        </Menu>

        {/* Search Bar */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          {/* <TextField
            variant="outlined"
            placeholder="Search..."
            size="small"
            sx={{
              width: '400px',
              backgroundColor: theme.palette.background.default,
              borderRadius: '20px',
              '& fieldset': {
                borderRadius: '20px',
              },
              '& input': {
                color: theme.palette.text.primary,
              },
              '& .MuiSvgIcon-root': {
                color: theme.palette.text.primary,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          /> */}
        </Box>

        {/* User Info and Notifications */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '30px', gap: '20px' }}>
          {username ? (
            <>
              <Typography variant="body1" color="textPrimary">
                Hello, {username}
              </Typography>


              <Tooltip title="Notifications">
                <IconButton
                  edge="end"
                  aria-label="notifications"
                  onClick={handleNotificationClick}
                  sx={{ color: theme.palette.text.primary }}
                >
                  <NotificationsIcon />
                </IconButton>
              </Tooltip>
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
              >
                <Box p={2} width={400}>
                  <Typography variant="h6" gutterBottom>
                    Notifications
                  </Typography>
                  <List>
                    {notifications.map((notification) => (
                      <Box key={notification.id} mb={2}>
                        <ListItem disablePadding>
                          <ListItemButton onClick={() => handleExpandNotification(notification.id)}>
                            <ListItemText
                              primary={notification.title}
                              secondary={dayjs(notification.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                            />
                          </ListItemButton>
                        </ListItem>
                        {expandedNotificationId === notification.id && (
                          <Typography variant="body2" color="textSecondary" sx={{ ml: 2, mt: 1 }}>
                            {notification.content}
                          </Typography>
                        )}
                        <Divider sx={{ mt: 2, mb: 2 }} />
                      </Box>
                    ))}
                  </List>
                </Box>
              </Popover>
              <Tooltip title="Log out">
                <IconButton
                  edge="end"
                  aria-label="logout"
                  onClick={logout}
                  sx={{ color: theme.palette.text.primary }}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Button color="primary" variant="outlined" href="/signup">
                Sign Up
              </Button>
              <Button color="primary" variant="contained" href="/login">
                Sign In
              </Button>
            </>
          )}
        </Box>

        {/* Theme Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
          <Typography
            variant="body1"
            style={{
              marginRight: '10px',
              color: theme.palette.text.primary,
            }}
          >
            {mode === 'light' ? 'Light Mode' : 'Dark Mode'}
          </Typography>
          <Brightness7
            style={{
              color: mode === 'light' ? theme.palette.warning.main : theme.palette.grey[500],
              marginRight: '5px',
            }}
          />
          <Switch
            checked={mode === 'dark'}
            onChange={handleToggleTheme}
            sx={{
              '& .MuiSwitch-thumb': {
                backgroundColor: mode === 'dark' ? theme.palette.warning.main : theme.palette.grey[300],
              },
              '& .MuiSwitch-track': {
                backgroundColor: mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[300],
              },
            }}
          />
          <Brightness4
            style={{
              color: mode === 'dark' ? theme.palette.warning.main : theme.palette.grey[500],
              marginLeft: '5px',
            }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
