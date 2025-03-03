"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

export default function MuiThemeProvider({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);

    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
            primary: {
                main: '#90caf9',
            },
            secondary: {
                main: '#f48fb1',
            },
            background: {
                default: '#121212',
                paper: '#1e1e1e',
            },
        },
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div style={{ visibility: 'hidden' }}>{children}</div>;
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}