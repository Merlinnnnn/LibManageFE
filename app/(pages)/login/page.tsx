"use client"
import React from 'react';
import Login from '../../component/Login/LoginPage';
import { CustomThemeProvider } from '@/app/component/Context/ThemeContext';

const LoginPage: React.FC = () => {
    return (
        <CustomThemeProvider>
            <Login />
        </CustomThemeProvider>
    );
};

export default LoginPage;
