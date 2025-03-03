"use client";

import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Créer un provider de thème qui s'exécute uniquement côté client
export default function ClientProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  // Créer le thème sombre
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

  // Utiliser useEffect pour marquer le composant comme monté côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Si nous ne sommes pas montés, renvoyer juste un div vide ou un placeholder
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  // Une fois monté côté client, on peut rendre le vrai contenu avec le thème
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}