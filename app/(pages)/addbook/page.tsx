"use client"
import React from 'react';
import AddBook from '../../component/Books/AddBookPage';
import { CustomThemeProvider } from '../../component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';
import RoleContext from '@/app/component/Context/RoleContext';

const AddBookPage: React.FC = () => {
    return (
        <AuthProvider>
            <CustomThemeProvider>
                <AddBook />
            </CustomThemeProvider>
        </AuthProvider>
    );
};

export default RoleContext(AddBookPage,['ADMIN','MANAGER']);
