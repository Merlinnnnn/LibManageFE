"use client"
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Typography, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const PaymentResultPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  const isSuccess = status === 'success';

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bgcolor="#f5f6fa"
      px={2}
    >
      <Box
        bgcolor="#fff"
        p={5}
        borderRadius={4}
        boxShadow={3}
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
        minWidth={320}
      >
        {isSuccess ? (
          <>
            <CheckCircleIcon color="success" sx={{ fontSize: 64 }} />
            <Typography variant="h5" fontWeight={700} color="success.main">
              Thanh toán thành công!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cảm ơn bạn đã thanh toán. Giao dịch của bạn đã được xử lý thành công.
            </Typography>
          </>
        ) : (
          <>
            <ErrorIcon color="error" sx={{ fontSize: 64 }} />
            <Typography variant="h5" fontWeight={700} color="error.main">
              Thanh toán thất bại
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.
            </Typography>
          </>
        )}
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3, borderRadius: 2, px: 4, py: 1 }}
          onClick={() => router.push('/')}
        >
          Quay về trang chủ
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentResultPage; 