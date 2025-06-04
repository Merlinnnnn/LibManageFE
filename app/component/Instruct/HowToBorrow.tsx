import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const HowToBorrowPage = () => (
  <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6 }}>
    <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={2} align="center">
        Hướng dẫn mượn tài liệu
      </Typography>
      <Typography variant="body1" mb={2}>
        Để mượn tài liệu, bạn hãy đăng nhập, tìm kiếm sách hoặc tài liệu mong muốn, sau đó nhấn nút "Mượn" hoặc "Đọc ngay". Tài liệu sẽ xuất hiện trong mục "Tủ sách của tôi" để bạn truy cập bất cứ lúc nào.
      </Typography>
      <Typography variant="body1">
        Nếu có thắc mắc về việc mượn/trả tài liệu, hãy liên hệ thủ thư để được giải đáp.
      </Typography>
    </Paper>
  </Box>
);

export default HowToBorrowPage; 