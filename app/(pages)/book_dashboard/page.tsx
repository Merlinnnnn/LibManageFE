"use client"
import React from 'react';
import BookDashBoard from '../../component/DashBoard/BookDashBoard';
import { CustomThemeProvider } from '../../component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';

const BookDashBoardPage: React.FC = () => {
    return (
        <AuthProvider>
            <CustomThemeProvider>
                <BookDashBoard />
            </CustomThemeProvider>
        </AuthProvider>
    );
};

export default BookDashBoardPage;
