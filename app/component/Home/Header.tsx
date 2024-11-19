import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Tooltip, IconButton, Box, Typography, TextField, InputAdornment, Switch, Menu, MenuItem, Popover, List, ListItem, ListItemText, ListItemButton, Divider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import Link from 'next/link';
import { useThemeContext } from '../Context/ThemeContext';
import { useTheme } from '@mui/material/styles';
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
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [username, setUsername] = useState<string | null>(null);
  const { toggleTheme, mode, setMode } = useThemeContext();
  const theme = useTheme();
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [expandedNotificationId, setExpandedNotificationId] = useState<string | null>(null);

  useEffect(() => {
    const storedUsername = sessionStorage.getItem('fullname');
    setUsername(storedUsername);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setMode(savedTheme as 'light' | 'dark');
    }
  }, [setMode]);

  const handleToggleTheme = () => {
    toggleTheme();
    const newMode = mode === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newMode);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
      console.log('Notifications response:', response);
      if (response.data && response.data.result && response.data.result.content) {
        setNotifications(response.data.result.content);
      } else {
        console.log('No notifications found.');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // useEffect(() => {
  //   fetchNotifications();
  // }, []);

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
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMenuOpen}
          sx={{ marginLeft: '10px' }}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem component={Link} href="/home" onClick={handleMenuClose}>Home</MenuItem>
          <MenuItem component={Link} href="/bookshelf" onClick={handleMenuClose}>Bookshelf</MenuItem>
          <MenuItem component={Link} href="/bookfavo" onClick={handleMenuClose}>Favorite</MenuItem>
          <MenuItem component={Link} href="/borrowed-book" onClick={handleMenuClose}>Borrowed Books</MenuItem>
        </Menu>

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
                  sx={{
                    color: theme.palette.text.primary,
                    margin: 0,
                    padding: 0,
                    alignSelf: 'center',
                  }}
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
                  <Typography variant="h6" gutterBottom>Các thông báo</Typography>
                  <List>
                    {notifications.map((notification) => (
                      <Box key={notification.id} mb={2}>
                        <ListItem disablePadding>
                          <ListItemButton onClick={() => handleExpandNotification(notification.id)}>
                            <ListItemText
                              primaryTypographyProps={{ style: { wordWrap: 'break-word', whiteSpace: 'normal' } }} primary={notification.title}
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
                  sx={{
                    color: theme.palette.text.primary,
                    margin: 0,
                    padding: 0,
                    alignSelf: 'center',
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Button color="primary" variant="outlined" href="/signup">Sign Up</Button>
              <Button color="primary" variant="contained" href="/login">Sign In</Button>
            </>
          )}
        </Box>

        <Box sx={{ marginRight: '20px' }}>
          <Typography
            variant="body1"
            style={{
              display: 'inline',
              marginRight: '10px',
              color: mode === 'light' ? 'black' : 'white',
            }}
          >
            {mode === 'light' ? 'Light Mode' : 'Dark Mode'}
          </Typography>
          <Switch checked={mode === 'dark'} onChange={handleToggleTheme} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
