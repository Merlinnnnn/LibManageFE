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
  const { toggleTheme, mode } = useThemeContext(); // Sử dụng từ CustomThemeProvider
  const theme = useTheme(); // Lấy theme từ MUI ThemeProvider
  const [username, setUsername] = useState<string | null>(null);
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [expandedNotificationId, setExpandedNotificationId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('fullname', '');
        const storedUsername = sessionStorage.getItem('fullname');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }
}, []);


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
        setNotifications(response.data.result.content);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const openNotifications = Boolean(notificationAnchor);

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
        {/* Menu Button */}
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ marginLeft: '10px' }}
        >
          <MenuIcon />
        </IconButton>

        {/* Search Field */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <TextField
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
          />
        </Box>

        {/* User Actions */}
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
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ ml: 2, mt: 1 }}
                          >
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
        <Box sx={{ marginRight: '20px' }}>
          <Typography
            variant="body1"
            style={{
              display: 'inline',
              marginRight: '10px',
              color: theme.palette.text.primary,
            }}
          >
            {mode === 'light' ? 'Light Mode' : 'Dark Mode'}
          </Typography>
          <Switch checked={mode === 'dark'} onChange={toggleTheme} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
