"use client"
import React from 'react';
import { CustomThemeProvider } from '@/app/component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';
import MyBookShelf from '@/app/component/AddBooks/MyBookShelf';


const MyBookShelfPage: React.FC = () => {
    return (
        <AuthProvider>
            <CustomThemeProvider>
                <MyBookShelf />
            </CustomThemeProvider>
        </AuthProvider>
    );
};

export default MyBookShelfPage;
