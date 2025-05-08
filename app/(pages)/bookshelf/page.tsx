"use client"
import React from 'react';
import { CustomThemeProvider } from '../../component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';
import dynamic from 'next/dynamic';

// Load BookShelf bằng dynamic import (tắt SSR nếu nó phụ thuộc window, etc.)
const DynamicBookShelf = dynamic(() => import('../../component/Books/BookShelf'), {
  ssr: false, // hoặc true nếu không cần tắt SSR
  loading: () => <p>Đang tải...</p>, // loading fallback
});

const BookShelfPage: React.FC = () => {
  return (
    <AuthProvider>
      <CustomThemeProvider>
        <DynamicBookShelf />
      </CustomThemeProvider>
    </AuthProvider>
  );
};

export default BookShelfPage;
