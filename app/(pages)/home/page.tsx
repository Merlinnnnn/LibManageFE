"use client"
import React from 'react';
import Home from '../../component/Home/HomePage';
import { CustomThemeProvider } from '../../component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';

const LoginPage: React.FC = () => {
    return (
        <AuthProvider>
            <CustomThemeProvider>
                <Home />
            </CustomThemeProvider>
        </AuthProvider>
    );
};

export default LoginPage;
