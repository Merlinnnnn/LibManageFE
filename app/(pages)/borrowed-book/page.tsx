"use client"
import React from 'react';
import BorrowedBooks from '../../component/BorrowHistory/BorrowedBooks';
import { CustomThemeProvider } from '../../component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';

const BorrowedBooksPage: React.FC = () => {
    return (
        <AuthProvider>
            <CustomThemeProvider>
                <BorrowedBooks />
            </CustomThemeProvider>
        </AuthProvider>
    );
};

export default BorrowedBooksPage;
