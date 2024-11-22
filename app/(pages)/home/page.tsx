"use client";
import React, { useEffect, useState } from 'react';
import Home from '../../component/Home/HomePage';
import { CustomThemeProvider } from '../../component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';

const HomePage: React.FC = () => {
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
                <Home />
            </CustomThemeProvider>
        </AuthProvider>
    );
};

export default HomePage;
