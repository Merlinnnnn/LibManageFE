import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, IconButton, Box, Typography, TextField, InputAdornment, Switch, Menu, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import { useThemeContext } from '../Context/ThemeContext';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../Context/AuthContext'; 

const Header = () => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [username, setUsername] = useState<string | null>(null);
  const { toggleTheme, mode } = useThemeContext();
  const theme = useTheme();
  const { logout } = useAuth();

  useEffect(() => {
    const storedUsername = sessionStorage.getItem('fullname');
    setUsername(storedUsername);
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
        {/* Icon Menu để mở menu chọn trang */}
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
              <Button color="secondary" variant="outlined" onClick={logout}>
                Logout
              </Button>
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
          <Switch checked={mode === 'dark'} onChange={toggleTheme} />
        </Box>

      </Toolbar>
    </AppBar>
  );
};

export default Header;
