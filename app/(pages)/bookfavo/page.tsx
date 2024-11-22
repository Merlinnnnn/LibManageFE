"use client"
import React, { useEffect, useState } from 'react';
import BookFavo from '../../component/Books/BookFavorite';
import { CustomThemeProvider } from '../../component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';

const BookFavoPage: React.FC = () => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <h1>Render Html</h1>; 
    }
    return (
        <AuthProvider>
            <CustomThemeProvider>
                <BookFavo />
            </CustomThemeProvider>
        </AuthProvider>
    );
};

export default BookFavoPage;
