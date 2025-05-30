"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import { CustomThemeProvider } from '@/app/component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';

const ReadWordPageClient = dynamic(
  () => import('../../component/ReadBook/ReadWordPage'),
  { ssr: false }
);

const ReadWordPage: React.FC = () => {
  return (
    <AuthProvider>
      <CustomThemeProvider>
        <ReadWordPageClient />
      </CustomThemeProvider>
    </AuthProvider>
  );
};

export default ReadWordPage; 