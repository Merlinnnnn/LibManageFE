import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

interface ThemeContextType {
    toggleTheme: () => void;
    mode: 'light' | 'dark';
    setMode: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useThemeContext must be used within a ThemeProvider');
    return context;
};

export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<'light' | 'dark'>(() => {
        const savedMode = localStorage.getItem('theme');
        return savedMode === 'dark' ? 'dark' : 'light'; 
    });

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        localStorage.setItem('theme', mode); 
        document.documentElement.setAttribute('data-theme', mode);
    }, [mode]);

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    ...(mode === 'light'
                        ? {
                              background: {
                                  default: '#ffffff',
                                  paper: '#f5f5f5',
                              },
                              text: {
                                  primary: '#000000',
                              },
                          }
                        : {
                              background: {
                                  default: '#222428',
                                  paper: '#222428',
                              },
                              text: {
                                  primary: '#ffffff',
                              },
                          }),
                },
            }),
        [mode]
    );

    return (
        <ThemeContext.Provider value={{ toggleTheme, mode, setMode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};
