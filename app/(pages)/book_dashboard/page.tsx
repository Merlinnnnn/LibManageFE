"use client"
import React from 'react';
import BookDashBoard from '../../component/DashBoard/BookDashBoard';
import { CustomThemeProvider } from '../../component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';
import RoleContext from '@/app/component/Context/RoleContext';

const BookDashBoardPage: React.FC = () => {
    return (
        <AuthProvider>
            <CustomThemeProvider>
                <BookDashBoard />
            </CustomThemeProvider>
        </AuthProvider>
    );
};

export default RoleContext(BookDashBoardPage,['ROLE_ADMIN']);
