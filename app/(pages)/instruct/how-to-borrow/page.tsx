"use client";
import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Chip,
  IconButton
} from '@mui/material';
import { 
  LibraryBooks as LibraryBooksIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Book as BookIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import Link from 'next/link';

const HowToBorrowPage = () => (
  <Box
    sx={{
      minHeight: '100dvh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden',
      p: 0,
      m: 0,
      '&::-webkit-scrollbar': { display: 'none' },
    }}
  >
    {/* Ảnh nền full màn hình */}
    <Box
      component="img"
      src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1500&q=80"
      alt="background"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100dvh',
        objectFit: 'cover',
        zIndex: -1,
        filter: 'brightness(0.55) blur(1px)',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={4} sx={{ 
        p: { xs: 2, md: 4 }, 
        borderRadius: 3,
        backgroundColor: '#f9f9f9',
        position: 'relative'
      }}>
        {/* Nút Home ở góc phải */}
        <Link href="/" passHref legacyBehavior>
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
        <Typography 
          variant="h4" 
          fontWeight={700} 
          mb={3} 
          align="center"
          color="primary"
        >
          Hướng dẫn mượn sách thư viện
        </Typography>
        
        <Chip 
          label="Mỗi thành viên chỉ được mượn tối đa 5 sách" 
          color="warning" 
          icon={<InfoIcon />}
          sx={{ mb: 3, mx: 'auto', fontSize: '1rem', p: 2 }}
        />
        
        <Typography variant="h6" fontWeight={600} mb={2} color="secondary.dark">
          Mượn sách vật lý
        </Typography>
        
        <List dense={false}>
          <ListItem>
            <ListItemIcon>
              <LibraryBooksIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Tìm sách trên hệ thống"
              secondary="Đăng nhập và tìm kiếm sách bạn muốn mượn"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Đăng ký mượn sách"
              secondary="Nhấn nút 'Mượn sách' trên trang chi tiết sách"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <QrCodeScannerIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Nhận sách tại thư viện"
              secondary="Đến thư viện trong vòng 3 ngày, quét QR code tại quầy để nhận sách"
            />
          </ListItem>
        </List>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" fontWeight={600} mb={2} color="secondary.dark">
          Mượn sách điện tử
        </Typography>
        
        <List dense={false}>
          <ListItem>
            <ListItemIcon>
              <BookIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Tìm sách điện tử"
              secondary="Tìm kiếm sách điện tử trong danh mục"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <ScheduleIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Gửi yêu cầu mượn"
              secondary="Nhấn 'Mượn sách' và chờ tác giả/người quản lý duyệt yêu cầu"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Đọc sách khi được duyệt"
              secondary="Khi được duyệt, sách sẽ xuất hiện trong mục 'Sách của tôi' để đọc"
            />
          </ListItem>
        </List>
        
        <Box sx={{ 
          backgroundColor: '#fff8e1', 
          p: 3, 
          borderRadius: 2, 
          mt: 4,
          borderLeft: '4px solid #ffc107'
        }}>
          <Typography variant="body1" fontWeight={600} mb={1}>
            Quy định mượn sách:
          </Typography>
          <List dense={true}>
            <ListItem sx={{ py: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                •
              </ListItemIcon>
              <ListItemText primary="Mỗi thành viên chỉ được mượn tối đa 5 sách cùng lúc" />
            </ListItem>
            <ListItem sx={{ py: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                •
              </ListItemIcon>
              <ListItemText primary="Muốn mượn thêm sách phải trả bớt sách đang mượn" />
            </ListItem>
            <ListItem sx={{ py: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                •
              </ListItemIcon>
              <ListItemText primary="Sách vật lý mượn tối đa 14 ngày, có thể gia hạn thêm 7 ngày" />
            </ListItem>
            <ListItem sx={{ py: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                •
              </ListItemIcon>
              <ListItemText primary="Sách điện tử có thời hạn mượn tùy theo quyết định của tác giả" />
            </ListItem>
          </List>
        </Box>
        
        <Typography variant="body2" mt={3} fontStyle="italic">
          Nếu có thắc mắc, vui lòng liên hệ quầy thủ thư hoặc gọi số 0123.456.789 để được hỗ trợ.
        </Typography>
      </Paper>
    </Container>
  </Box>
);

export default HowToBorrowPage;