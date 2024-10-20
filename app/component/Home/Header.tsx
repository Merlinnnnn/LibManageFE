import React, { useState } from 'react';
import { AppBar, Toolbar, Button, IconButton, Box, Typography, TextField, InputAdornment, Switch } from '@mui/material';
import LoginForm from './LoginForm';
import Image from 'next/image';
import Link from 'next/link';
import SearchIcon from '@mui/icons-material/Search';
import { useThemeContext } from '../Context/ThemeContext';
import { useTheme } from '@mui/material/styles'; // Import useTheme để sử dụng màu từ theme

const Header = () => {
  const [open, setOpen] = useState(false);
  const { toggleTheme, mode } = useThemeContext();
  const theme = useTheme(); // Lấy màu từ theme

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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
        <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: '10px', flexGrow: 1 }}>
          <Link href="/home" passHref>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton size="large" edge="start" color="inherit" aria-label="logo" >
                <Image src="/logo.png" alt="Logo" width={70} height={50} />
              </IconButton>
              <Image src="/logo-text.png" alt="Logo" width={300} height={50} />
            </Box>
          </Link>
          {/* <Typography
            variant="h4"
            component="div"
            sx={{
              marginLeft: '10px',
              color: theme.palette.text.primary,
              fontSize: '32px',
              fontWeight: 'bold',
              letterSpacing: '1px',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            Public Lib
          </Typography> */}
        </Box>

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

        <Box sx={{ display: 'flex', marginRight: '30px', gap: '20px', flexGrow: 1, justifyContent: 'flex-end' }}>
          <Button color="primary" variant="outlined" href="/signup">Sign Up</Button>
          <Button color="primary" variant="contained" href="/login">Sign In</Button>
        </Box>

        {/* Toggle button để chuyển đổi giữa dark và light mode */}
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

        <LoginForm open={open} handleClose={handleClose} />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
