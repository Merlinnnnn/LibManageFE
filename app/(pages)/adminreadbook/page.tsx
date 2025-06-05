"use client"
import React from 'react';
import AdminReadBook from '../../component/ReadBook/AdminReadBookPage';
import { CustomThemeProvider } from '../../component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';
import RoleContext from '@/app/component/Context/RoleContext';

const AdminReadBookPage: React.FC = () => {
    return (
        <AuthProvider>
            <CustomThemeProvider>
                <AdminReadBook />
            </CustomThemeProvider>
        </AuthProvider>
    );
};

export default RoleContext(AdminReadBookPage,['ADMIN','MANAGER']);
