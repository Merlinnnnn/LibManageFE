"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import { CustomThemeProvider } from '@/app/component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';

const ReadPdfPageClient = dynamic(
  () => import('../../component/ReadBook/ReadBookPage'),
  { ssr: false }
);

const ReadPdfPage: React.FC = () => {
  return (
    <AuthProvider>
      <CustomThemeProvider>
        <ReadPdfPageClient />
      </CustomThemeProvider>
    </AuthProvider>
  );
};

export default ReadPdfPage; 