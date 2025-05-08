"use client";
import React from 'react';
import Home from '../../component/Home/HomePage';
import { CustomThemeProvider } from '../../component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';
import dynamic from 'next/dynamic';
import { Box, Skeleton } from '@mui/material';

// Sử dụng dynamic import để tải Home component với loading state
const DynamicHome = dynamic(
  () => import('../../component/Home/HomePage'),
  {
    loading: () => (
      <Box sx={{ width: '100%', padding: 3 }}>
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton variant="rectangular" width="100%" height={300} sx={{ marginTop: 2 }} />
        <Skeleton variant="text" width="80%" height={40} sx={{ marginTop: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={300} sx={{ marginTop: 2 }} />
        <Skeleton variant="text" width="50%" height={40} sx={{ marginTop: 2 }} />
      </Box>
    ),
    ssr: false // Tắt SSR cho component này nếu cần
  }
);

const HomePage: React.FC = () => {
  return (
    <AuthProvider>
      <CustomThemeProvider>
        <DynamicHome />
      </CustomThemeProvider>
    </AuthProvider>
  );
};

export default HomePage;