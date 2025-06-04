import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ResearchHelpPage = () => (
  <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6 }}>
    <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={2} align="center">
        Hỗ trợ nghiên cứu
      </Typography>
      <Typography variant="body1" mb={2}>
        Nếu bạn cần hỗ trợ về tìm kiếm tài liệu, trích dẫn, hoặc các vấn đề học thuật khác, hãy sử dụng chức năng chat trực tuyến hoặc gửi email cho thủ thư. Chúng tôi luôn sẵn sàng hỗ trợ bạn trong quá trình học tập và nghiên cứu.
      </Typography>
      <Typography variant="body1">
        Đừng ngần ngại liên hệ với chúng tôi để được tư vấn và hỗ trợ tốt nhất!
      </Typography>
    </Paper>
  </Box>
);

export default ResearchHelpPage; 