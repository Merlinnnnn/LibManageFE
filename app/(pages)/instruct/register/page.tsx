"use client"
import React from 'react';
import { Box, Typography, Paper, Button, List, ListItem, ListItemText, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import Link from 'next/link';

const RegisterPage = () => (
  <Box
    sx={{
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden',
      p: 0,
      m: 0,
      position: 'relative',
    }}
  >
    {/* Ảnh nền full màn hình */}
    <Box
      component="img"
      src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
      alt="background"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: -1,
        filter: 'brightness(0.5)',
      }}
    />
    {/* Box căn giữa nội dung */}
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 0,
        m: 0,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 3,
          maxWidth: 600,
          width: '100%',
          mx: 2,
          background: 'rgba(255,255,255,0.95)',
          boxShadow: 8,
          position: 'relative',
        }}
      >
        {/* Nút Home */}
        <Link href="/">
          <IconButton
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'primary.main',
              bgcolor: 'grey.100',
              boxShadow: 1,
              '&:hover': { bgcolor: 'primary.light', color: 'white' },
              zIndex: 2,
            }}
          >
            <HomeIcon />
          </IconButton>
        </Link>

        <Typography variant="h4" fontWeight={700} mb={2} align="center" color="primary">
          Hướng dẫn đăng ký thẻ thư viện
        </Typography>
        <Typography align="center" mb={3}>
          Trở thành thành viên thư viện chỉ với 4 bước đơn giản
        </Typography>

        <List>
          <ListItem>
            <ListItemText
              primary={<b>Bước 1: Truy cập trang đăng ký</b>}
              secondary="Nhấn vào nút 'Đăng ký' ở góc trên bên phải trang chủ."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={<b>Bước 2: Điền thông tin cá nhân</b>}
              secondary="Nhập đầy đủ thông tin bao gồm họ tên, email, số điện thoại và địa chỉ."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={<b>Bước 3: Xác nhận email</b>}
              secondary="Kiểm tra email và nhấn vào liên kết xác nhận để kích hoạt tài khoản."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={<b>Bước 4: Nhận thẻ thư viện</b>}
              secondary="Sau khi đăng ký thành công, bạn có thể đến thư viện để nhận thẻ vật lý hoặc sử dụng thẻ số ngay lập tức."
            />
          </ListItem>
        </List>

        <Typography variant="body2" color="text.secondary" mt={2} mb={3}>
          <i>
            Lưu ý: Thẻ thư viện có giá trị sử dụng trong vòng 1 năm. Bạn cần gia hạn thẻ khi hết hạn để tiếp tục sử dụng dịch vụ.
          </i>
        </Typography>

        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          sx={{ fontWeight: 700, borderRadius: 2, mt: 1 }}
        >
          Đăng ký ngay
        </Button>
      </Paper>
    </Box>
  </Box>
);

export default RegisterPage;
