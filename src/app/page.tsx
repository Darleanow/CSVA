"use client";

import { useAuth } from "./context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Box, Typography, Button, CircularProgress, Paper } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

export default function Home() {
  const { user, signIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (user) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress sx={{ mb: 3 }} />
        <Typography variant="h6">Redirection vers le tableau de bord...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: '450px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
          CSV Analyzer
        </Typography>

        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', textAlign: 'center' }}>
          Connectez-vous pour commencer à analyser vos fichiers CSV
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<GoogleIcon />}
          onClick={signIn}
          fullWidth
          sx={{ py: 1.5 }}
        >
          Se connecter avec Google
        </Button>
      </Paper>
    </Box>
  );
}