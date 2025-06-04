"use client";
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Grid,
  Button,
  List,
  ListItem,
  ListItemIcon,
  Avatar,
  Chip,
  ListItemText,
  IconButton
} from '@mui/material';
import {
  SupportAgent as SupportAgentIcon,
  Chat as ChatIcon,
  Search as SearchIcon,
  AutoStories as AutoStoriesIcon,
  Summarize as SummarizeIcon,
  ContactSupport as ContactSupportIcon,
  SmartToy as SmartToyIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import Link from 'next/link';

const ResearchHelpPage = () => (
  <Box
    sx={{
      minHeight: '100vh',
      width: '100%',
      position: 'relative',
      overflowX: 'hidden', // ✅ chỉ ẩn tràn ngang, không cắt tràn dọc
      p: 0,
      m: 0,
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
        width: '100%',
        height: '100vh', // ✅ thay vì 100dvh
        objectFit: 'cover',
        zIndex: -1,
        filter: 'brightness(0.55) blur(1px)',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{
        p: { xs: 3, md: 5 },
        borderRadius: 4,
        background: 'linear-gradient(to bottom, #f5f9ff, #ffffff)',
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
        <Box textAlign="center" mb={4}>
          <Chip
            label="HỖ TRỢ THÔNG MINH"
            color="primary"
            variant="outlined"
            sx={{ mb: 2, fontSize: '0.8rem', fontWeight: 'bold' }}
          />
          <Typography
            variant="h3"
            fontWeight={700}
            color="primary.main"
            sx={{
              mb: 2,
              background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Trung tâm Hỗ trợ Tra cứu
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Khám phá sức mạnh AI trong việc tìm kiếm và đánh giá tài liệu
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Chatbot hỗ trợ */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: '90%', borderRadius: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <SmartToyIcon />
                </Avatar>
                <Typography variant="h5" fontWeight={600}>
                  Thủ thư ảo AI
                </Typography>
              </Box>
              <Typography variant="body1" mb={3}>
                Chatbot thông minh của chúng tôi có thể:
              </Typography>
              <List dense={false}>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <SearchIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Hỗ trợ tìm kiếm nâng cao"
                    secondary="Giúp bạn tìm đúng tài liệu cần thiết với từ khóa thông minh"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <SummarizeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Gợi ý tài liệu nhanh chóng"
                    secondary="Tìm kiếm nhanh chóng, chính xác các tài liệu mà bạn cần"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <ContactSupportIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Trả lời 24/7"
                    secondary="Hỗ trợ mọi lúc mọi nơi với các câu hỏi về thư viện"
                  />
                </ListItem>
              </List>
              <Box textAlign="center" mt={3}>
                <Button
                  variant="contained"
                  startIcon={<ChatIcon />}
                  size="large"
                  sx={{
                    px: 4,
                    background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
                    fontWeight: 'bold'
                  }}
                >
                  Trò chuyện ngay
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Tóm tắt sách điện tử */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: '90%', borderRadius: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <AutoStoriesIcon />
                </Avatar>
                <Typography variant="h5" fontWeight={600}>
                  Tóm tắt sách điện tử bằng AI
                </Typography>
              </Box>
              <Typography variant="body1" mb={3}>
                Công nghệ AI của chúng tôi có thể giúp bạn:
              </Typography>
              <List dense={false}>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <SummarizeIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Tóm tắt nội dung chính"
                    secondary="Tổng hợp ý chính của sách trong 1 phút đọc"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <SearchIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Hỗ trợ tra cứu"
                    secondary="Giúp bạn có thể rõ ràng nội dung sách một cách nhanh chóng"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <SupportAgentIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Duyệt tài liệu"
                    secondary="Duyệt tài liệu bằng AI để đảm bảo tính chính xác và đầy đủ"
                  />
                </ListItem>
              </List>
              <Box textAlign="center" mt={3}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AutoStoriesIcon />}
                  size="large"
                  sx={{
                    px: 4,
                    fontWeight: 'bold'
                  }}
                >
                  Dùng thử ngay
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  </Box>
);

export default ResearchHelpPage;
