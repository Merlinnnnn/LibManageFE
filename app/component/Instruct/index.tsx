import React from 'react';
import { Box, Typography, Grid, Button, Paper } from '@mui/material';
import Link from 'next/link';

const InstructPage = () => {
  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Hướng dẫn sử dụng thư viện
      </Typography>
      <Typography variant="body1" mb={4}>
        Chào mừng bạn đến với trung tâm hướng dẫn sử dụng thư viện số. Hãy chọn một mục bên dưới để xem chi tiết hướng dẫn.
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Link href="/instruct/register" passHref legacyBehavior>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, textAlign: 'center', cursor: 'pointer', transition: '0.2s', '&:hover': { boxShadow: 8, backgroundColor: 'primary.light', color: 'white' } }}>
              <Typography variant="h6" fontWeight={600} mb={1}>Đăng ký thẻ thư viện</Typography>
              <Typography variant="body2">Hướng dẫn đăng ký thẻ thư viện trực tuyến hoặc tại quầy.</Typography>
            </Paper>
          </Link>
        </Grid>
        <Grid item xs={12} md={4}>
          <Link href="/instruct/how-to-borrow" passHref legacyBehavior>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, textAlign: 'center', cursor: 'pointer', transition: '0.2s', '&:hover': { boxShadow: 8, backgroundColor: 'primary.light', color: 'white' } }}>
              <Typography variant="h6" fontWeight={600} mb={1}>Mượn tài liệu</Typography>
              <Typography variant="body2">Quy trình mượn sách điện tử, sách nói và tài liệu số.</Typography>
            </Paper>
          </Link>
        </Grid>
        <Grid item xs={12} md={4}>
          <Link href="/instruct/research-help" passHref legacyBehavior>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, textAlign: 'center', cursor: 'pointer', transition: '0.2s', '&:hover': { boxShadow: 8, backgroundColor: 'primary.light', color: 'white' } }}>
              <Typography variant="h6" fontWeight={600} mb={1}>Hỗ trợ nghiên cứu</Typography>
              <Typography variant="body2">Liên hệ thủ thư để được hỗ trợ nghiên cứu học thuật.</Typography>
            </Paper>
          </Link>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InstructPage; 