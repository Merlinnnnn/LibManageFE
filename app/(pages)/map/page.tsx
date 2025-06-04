"use client"
import React from 'react';
import Map from '../../component/Location/LibraryMap';
import { CustomThemeProvider } from '@/app/component/Context/ThemeContext';
import { AuthProvider } from '@/app/component/Context/AuthContext';
import RoleContext from '@/app/component/Context/RoleContext';

const MapPage: React.FC = () => {
    return (
        <AuthProvider>
            <CustomThemeProvider>
                <Map />
            </CustomThemeProvider>
        </AuthProvider>
    );
};

export default RoleContext(MapPage,['ADMIN','MANAGER']);
