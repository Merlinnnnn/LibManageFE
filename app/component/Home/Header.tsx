import React, { useState } from 'react';
import { AppBar, Toolbar, Button, IconButton, Box } from '@mui/material';
import LoginForm from './LoginForm'; // Import component LoginForm
import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          {/* Logo */}
          <Link href="/" passHref>
            <IconButton size="large" edge="start" color="inherit" aria-label="logo" sx={{ mr: 2 }}>
              <Image src="/logo.png" alt="Logo" width={50} height={50} />
            </IconButton>
          </Link>
        </Box>

        {/* Nút đăng ký và đăng nhập */}
        <Button color="inherit" href="/signup">Sign Up</Button>
        <Button color="inherit" onClick={handleClickOpen}>Sign In</Button>

        {/* Form đăng nhập */}
        <LoginForm open={open} handleClose={handleClose} />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
