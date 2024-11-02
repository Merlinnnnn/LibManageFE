"use client"
import React from 'react';
import Loan from '../../component/LoanManager/LoanManagerPage';
import { CustomThemeProvider } from '../../component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';

const LoanManager: React.FC = () => {
    return (
        <AuthProvider>
            <CustomThemeProvider>
                <Loan />
            </CustomThemeProvider>
        </AuthProvider>
    );
};

export default LoanManager;
