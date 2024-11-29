"use client"
import React from 'react';
import SignUp from '../../component/SignUp/SignUpPage';
import { CustomThemeProvider } from '@/app/component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';

const SignUpPage: React.FC = () => {
    return (
        <AuthProvider>
            <CustomThemeProvider>
                <SignUp />
            </CustomThemeProvider>
        </AuthProvider>
    );
};

export default SignUpPage;
