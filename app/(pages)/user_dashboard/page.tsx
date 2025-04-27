"use client"
import React from 'react';
import DashBoard from '../../component/DashBoard/DashBoard';
import { CustomThemeProvider } from '../../component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';
import RoleContext from '@/app/component/Context/RoleContext';

const DashBoardPage: React.FC = () => {
    return (
        <AuthProvider>
            <CustomThemeProvider>
                <DashBoard />
            </CustomThemeProvider>
        </AuthProvider>
    );
};

export default RoleContext(DashBoardPage,['ADMIN']);
