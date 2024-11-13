"use client"
import React from 'react';
import ReadBook from '../../component/Books/ReadBook';
import { CustomThemeProvider } from '@/app/component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';

const ReadPage: React.FC = () => {
    return (
        <AuthProvider>
            <CustomThemeProvider>
                <ReadBook />
            </CustomThemeProvider>
        </AuthProvider>
    );
};

export default ReadPage;
