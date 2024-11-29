"use client"
import React from 'react';
import BookManage from '../../component/Books/BookManager';
import { CustomThemeProvider } from '../../component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';
import RoleContext from '@/app/component/Context/RoleContext';

const BookManagePage: React.FC = () => {
    return (
        <AuthProvider>
            <CustomThemeProvider>
                <BookManage />
            </CustomThemeProvider>
        </AuthProvider>
    );
};

export default RoleContext(BookManagePage,['ROLE_ADMIN']);
