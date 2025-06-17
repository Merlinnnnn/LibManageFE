"use client"
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Typography, Button, TextField, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import apiService from '@/app/untils/api';

interface ResetPasswordResponse {
  success: boolean;
  message?: string;
}

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<null | boolean>(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setMessage('Vui lòng nhập đầy đủ mật khẩu mới và xác nhận mật khẩu.');
      setSuccess(false);
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Mật khẩu xác nhận không khớp.');
      setSuccess(false);
      return;
    }
    if (!token) {
      setMessage('Liên kết không hợp lệ hoặc đã hết hạn.');
      setSuccess(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiService.post<ResetPasswordResponse>('/api/v1/auth/reset-password', {
        token,
        password,
        confirmPassword,
      });
      if (res.data.success) {
        setSuccess(true);
        setMessage('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.');
      } else {
        setSuccess(false);
        setMessage(res.data.message || 'Có lỗi xảy ra.');
      }
    } catch (err: any) {
      setSuccess(false);
      setMessage(err?.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

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
        minWidth={340}
      >
        {success === true ? (
          <>
            <CheckCircleIcon color="success" sx={{ fontSize: 64 }} />
            <Typography variant="h5" fontWeight={700} color="success.main">
              Đặt lại mật khẩu thành công!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Bạn có thể đăng nhập với mật khẩu mới.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3, borderRadius: 2, px: 4, py: 1 }}
              onClick={() => router.push('/login')}
            >
              Đăng nhập
            </Button>
          </>
        ) : success === false ? (
          <>
            <ErrorIcon color="error" sx={{ fontSize: 64 }} />
            <Typography variant="h5" fontWeight={700} color="error.main">
              Đặt lại mật khẩu thất bại
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {message}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3, borderRadius: 2, px: 4, py: 1 }}
              onClick={() => setSuccess(null)}
            >
              Thử lại
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h5" fontWeight={700} color="primary">
              Đặt lại mật khẩu
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Nhập mật khẩu mới cho tài khoản của bạn.
            </Typography>
            <Box component="form" onSubmit={handleSubmit} width="100%" display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Mật khẩu mới"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Xác nhận mật khẩu"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                fullWidth
                required
              />
              {message && (
                <Typography color="error" fontSize={14}>{message}</Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ borderRadius: 2, px: 4, py: 1 }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Đặt lại mật khẩu'}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ResetPasswordPage; 