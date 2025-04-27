"use client"
import React from 'react';
import LoanDashBoard from '../../component/DashBoard/LoanDashBoard';
import { CustomThemeProvider } from '../../component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';
import RoleContext from '@/app/component/Context/RoleContext';

const LoanDashBoardPage: React.FC = () => {
    return (
        <AuthProvider>
            <CustomThemeProvider>
                <LoanDashBoard />
            </CustomThemeProvider>
        </AuthProvider>
    );
};

export default RoleContext(LoanDashBoardPage,['ADMIN']);
