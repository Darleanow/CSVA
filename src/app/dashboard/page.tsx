"use client";

import AuthGuard from "../components/auth-guard";
import { useAuth } from "../context/auth-context";
import React, { useState, ChangeEvent, FormEvent } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';

interface Statistics {
  moyenne: number;
  mediane: number;
  'ecart-type': number;
  'resume complet': Record<string, number>;
}

interface ColumnStatistics {
  [key: string]: Statistics;
}

interface Anomaly {
  ID: string | number;
  Errors: string[];
}

interface AnalysisResults {
  statistics: ColumnStatistics;
  anomalies: Anomaly[];
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!file) {
      setError("Veuillez sélectionner un fichier CSV");
      return;
    }

    if (!user) {
      setError("Vous devez être connecté pour analyser un fichier");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const fileContent = await file.text();

      const response = await fetch('https://europe-west2-csva-449810.cloudfunctions.net/csv-analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/csv',
        },
        body: fileContent
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
      }

      const data: AnalysisResults = await response.json();
      setResults(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue';
      setError(`Erreur lors de l'analyse du CSV: ${errorMessage}`);
      console.error("Erreur détaillée:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatistics = (stats: ColumnStatistics) => {
    return (
      <Grid container spacing={3}>
        {Object.entries(stats).map(([key, value]) => (
          <Grid item xs={12} md={4} key={key}>
            <Card variant="outlined">
              <CardHeader
                title={key}
                titleTypographyProps={{ variant: 'h6' }}
                sx={{ pb: 0 }}
              />
              <CardContent>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Moyenne
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {value.moyenne.toFixed(2)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Médiane
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {value.mediane.toFixed(2)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Écart-type
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {value['ecart-type'].toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <AuthGuard>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Dashboard
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={signOut}
            size="small"
          >
            Déconnexion
          </Button>
        </Box>

        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={3}
          sx={{ p: 3, mb: 4 }}
        >
          <Box sx={{ mb: 3 }}>
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ py: 1.5 }}
            >
              Sélectionner un fichier CSV
              <VisuallyHiddenInput
                type="file"
                accept=".csv"
                onChange={handleFileChange}
              />
            </Button>
            {file && (
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Fichier sélectionné: {file.name}
              </Typography>
            )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading || !file || !user}
            fullWidth
            sx={{ py: 1.5 }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Analyse en cours...
              </Box>
            ) : (
              'Analyser le CSV'
            )}
          </Button>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {results && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
              Résultats de l'analyse
            </Typography>

            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Statistiques
              </Typography>
              {renderStatistics(results.statistics)}
            </Paper>

            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Anomalies détectées ({results.anomalies.length})
              </Typography>

              {results.anomalies.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Erreurs</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {results.anomalies.map((anomaly, index) => (
                        <TableRow key={index}>
                          <TableCell>{anomaly.ID}</TableCell>
                          <TableCell>{anomaly.Errors.join(', ')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body1">
                  Aucune anomalie détectée
                </Typography>
              )}
            </Paper>
          </Box>
        )}
      </Container>
    </AuthGuard>
  );
}