"use client";
import React, { useEffect, useState } from 'react';
import Home from '../../component/Home/HomePage';
import { CustomThemeProvider } from '../../component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
const HomePage: React.FC = () => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <Box sx={{ width: '100%', padding: 3 }}>
                <Skeleton variant="text" width="60%" height={40} />
                <Skeleton variant="rectangular" width="100%" height={300} sx={{ marginTop: 2 }} />
                <Skeleton variant="text" width="80%" height={40} sx={{ marginTop: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={300} sx={{ marginTop: 2 }} />
                <Skeleton variant="text" width="50%" height={40} sx={{ marginTop: 2 }} />
            </Box>
        );
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
