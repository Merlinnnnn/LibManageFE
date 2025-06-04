import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const RegisterPage = () => (
  <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6 }}>
    <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={2} align="center">
        Hướng dẫn đăng ký thẻ thư viện
      </Typography>
      <Typography variant="body1" mb={2}>
        Để đăng ký thẻ thư viện, bạn chỉ cần tạo tài khoản trên website này bằng email cá nhân. Sau khi đăng ký, bạn sẽ có quyền truy cập và sử dụng toàn bộ tài nguyên số của thư viện.
      </Typography>
      <Typography variant="body1">
        Nếu gặp khó khăn trong quá trình đăng ký, hãy liên hệ thủ thư để được hỗ trợ trực tiếp.
      </Typography>
    </Paper>
  </Box>
);

export default RegisterPage; 