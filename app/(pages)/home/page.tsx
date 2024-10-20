"use client"
import React from 'react';
import Home from '../../component/Home/HomePage';
import { CustomThemeProvider } from '../../component/Context/ThemeContext';

const LoginPage: React.FC = () => {
    return (
        <CustomThemeProvider>
            <Home />
        </CustomThemeProvider>
    );
};

export default LoginPage;
