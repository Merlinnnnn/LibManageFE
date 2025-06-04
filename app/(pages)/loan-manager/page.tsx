"use client"
import React from 'react';
import Loan from '../../component/LoanManager/LoanManagerPage';
import { CustomThemeProvider } from '../../component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';
import RoleContext from '@/app/component/Context/RoleContext';

const LoanManager: React.FC = () => {
    return (
        <AuthProvider>
            <CustomThemeProvider>
                <Loan />
            </CustomThemeProvider>
        </AuthProvider>
    );
};

export default RoleContext(LoanManager,['ADMIN','MANAGER']);
