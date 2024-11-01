"use client"
import React from 'react';
import BookFavo from '../../component/Books/BookFavorite';
import { CustomThemeProvider } from '../../component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';

const BookFavoPage: React.FC = () => {
    return (
        <AuthProvider>
            <CustomThemeProvider>
                <BookFavo />
            </CustomThemeProvider>
        </AuthProvider>
    );
};

export default BookFavoPage;
