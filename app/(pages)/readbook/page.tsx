'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { CustomThemeProvider } from '@/app/component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';

// 👉 Import ReadBookPageClient mà không SSR
const ReadBookPageClient = dynamic(
  () => import('../../component/ReadBook/ReadBookPage'),
  { ssr: false }
);

const ReadPage: React.FC = () => {
  return (
    <AuthProvider>
      <CustomThemeProvider>
        <ReadBookPageClient />
      </CustomThemeProvider>
    </AuthProvider>
  );
};

export default ReadPage;
