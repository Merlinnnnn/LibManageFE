"use client"
import React from 'react';
import BookShelf from '../../component/Books/BookShelf';
import { CustomThemeProvider } from '../../component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';

const BookShelfPage: React.FC = () => {
    return (
        <AuthProvider>
            <CustomThemeProvider>
                <BookShelf />
            </CustomThemeProvider>
        </AuthProvider>
    );
};

export default BookShelfPage;
