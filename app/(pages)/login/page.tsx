"use client"
import React from 'react';
import Login from '../../component/Login/LoginPage';
import { CustomThemeProvider } from '@/app/component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';

const LoginPage: React.FC = () => {
    return (
        <AuthProvider>
            <CustomThemeProvider>
                <Login />
            </CustomThemeProvider>
        </AuthProvider>
    );
};

export default LoginPage;
