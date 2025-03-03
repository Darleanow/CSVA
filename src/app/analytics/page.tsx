"use client";

import AuthGuard from "../components/auth-guard";
import { useAuth } from "../context/auth-context";
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  Chip,
  Tooltip,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BarChartIcon from '@mui/icons-material/BarChart'; 
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';

interface Analysis {
  analysis_id: string;
  timestamp: string;
  filename?: string;
  csv_url: string;
  json_url: string;
  stats?: Record<string, any>;
  anomalies?: Array<any>;
}

interface Anomaly {
  ID: string | number;
  Errors: string[];
}

// Style personnalisé pour les cartes avec hover effect
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

// Header de section stylisé
const SectionHeader = styled(Typography)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(1),
  fontWeight: 600,
  '&:after': {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '40px',
    height: '3px',
    backgroundColor: theme.palette.primary.main,
  },
}));

export default function PreviousAnalyses() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, signOut } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<number>(0);

  useEffect(() => {
    fetchAnalyses();
  }, [user]);

  const fetchAnalyses = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      
      const response = await fetch('https://get-user-analyses-165250746259.europe-north1.run.app/list-analyses', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Données reçues:", data);
      setAnalyses(data.analyses || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue';
      setError(`Erreur lors de la récupération des analyses: ${errorMessage}`);
      console.error("Erreur détaillée:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction auxiliaire pour déclencher le téléchargement
  const triggerDownload = (blob: Blob, filename: string) => {
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Nettoyage
    setTimeout(() => {
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    }, 100);
  };

  const downloadFile = async (analysisId: string, fileType: 'csv' | 'json') => {
    try {
      setIsLoading(true);
      const token = await user.getIdToken();
      
      // Utiliser notre fonction de proxy pour télécharger le fichier
      const response = await fetch(`https://get-user-analyses-165250746259.europe-north1.run.app/download-file?id=${analysisId}&type=${fileType}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur de téléchargement: ${response.status}`);
      }
      
      const blob = await response.blob();
      triggerDownload(blob, `analyse-${analysisId}.${fileType}`);
      
    } catch (err) {
      console.error(`Erreur lors du téléchargement du fichier:`, err);
      setError(`Erreur lors du téléchargement: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const viewAnalysis = async (analysisId: string) => {
    setIsLoading(true);
    
    try {
      const token = await user.getIdToken();
      
      const response = await fetch(`https://get-single-analysis-165250746259.europe-north1.run.app/get-analysis?id=${analysisId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Détails de l'analyse:", data);
      
      setSelectedAnalysis(data);
      setDialogOpen(true);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue';
      setError(`Erreur lors de la récupération de l'analyse: ${errorMessage}`);
      console.error("Erreur détaillée:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedAnalysis(null);
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp) return "Date inconnue";
    
    try {
      return new Date(timestamp).toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Format de date invalide";
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const getAnalysisName = (analysis: Analysis, index: number) => {
    if (analysis.filename) return analysis.filename;
    
    // Si pas de filename, essayer d'extraire l'ID court pour un nom plus convivial
    const shortId = analysis.analysis_id.split('-')[0];
    return `Analyse ${shortId || index + 1}`;
  };

  // Génère une couleur basée sur la valeur
  const getColorForValue = (value: number, min: number, max: number) => {
    // Échelle de couleur: bleu foncé (bon) à bleu clair (moins bon)
    if (value >= (max * 0.8)) return '#1565C0'; // Bleu foncé pour les valeurs élevées
    if (value >= (max * 0.6)) return '#1976D2';
    if (value >= (max * 0.4)) return '#2196F3';
    if (value >= (max * 0.2)) return '#64B5F6';
    return '#BBDEFB'; // Bleu très clair pour les valeurs basses
  };

  // Rendu des statistiques dans le dialogue
  const renderStats = (stats: Record<string, any>) => {
    if (!stats || Object.keys(stats).length === 0) {
      return <Alert severity="info">Aucune statistique disponible</Alert>;
    }

    return (
      <Grid container spacing={3}>
        {Object.entries(stats).map(([key, value]) => {
          if (!value || typeof value !== 'object') return null;
          
          // Déterminer les valeurs min et max pour la coloration
          const max = Math.max(value.max || 0, value.mean * 2 || 0);
          const min = Math.min(value.min || 0, 0);
          
          return (
            <Grid item xs={12} md={4} key={key}>
              <StyledCard variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">{key}</Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Moyenne</Typography>
                    <Chip 
                      label={value.mean?.toFixed(2) || 'N/A'} 
                      size="small" 
                      sx={{ 
                        bgcolor: getColorForValue(value.mean || 0, min, max),
                        color: 'white',
                        fontWeight: 'bold' 
                      }} 
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Médiane</Typography>
                    <Chip 
                      label={value['50%']?.toFixed(2) || 'N/A'} 
                      size="small"
                      sx={{ 
                        bgcolor: getColorForValue(value['50%'] || 0, min, max),
                        color: 'white',
                        fontWeight: 'bold' 
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Écart-type</Typography>
                    <Typography variant="body2" fontWeight="medium">{value.std?.toFixed(2) || 'N/A'}</Typography>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Min</Typography>
                      <Typography variant="body2" fontWeight="medium">{value.min?.toFixed(2) || 'N/A'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" align="right">Max</Typography>
                      <Typography variant="body2" fontWeight="medium">{value.max?.toFixed(2) || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  // Rendu des anomalies
  const renderAnomalies = (anomalies: Anomaly[]) => {
    if (!anomalies || anomalies.length === 0) {
      return (
        <Alert severity="success" sx={{ mt: 2 }}>
          Aucune anomalie détectée dans ce jeu de données
        </Alert>
      );
    }

    return (
      <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
              <TableCell><Typography fontWeight="bold">ID</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Erreurs détectées</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {anomalies.map((anomaly, idx) => (
              <TableRow key={idx} hover>
                <TableCell>{anomaly.ID}</TableCell>
                <TableCell>
                  {anomaly.Errors.map((err, i) => (
                    <Chip
                      key={i}
                      label={err}
                      size="small"
                      color="error"
                      variant="outlined"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Rendu de la carte d'analyse
  const renderAnalysisCard = (analysis: Analysis, index: number) => {
    const hasAnomalies = analysis.anomalies && analysis.anomalies.length > 0;
    
    return (
      <Grid item xs={12} sm={6} md={4} key={analysis.analysis_id}>
        <StyledCard variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="h6" component="div" noWrap>
                {getAnalysisName(analysis, index)}
              </Typography>
              {hasAnomalies && (
                <Tooltip title={`${analysis.anomalies?.length} anomalies détectées`}>
                  <Badge badgeContent={analysis.anomalies?.length} color="error">
                    <ErrorOutlineIcon color="action" />
                  </Badge>
                </Tooltip>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
              <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {formatDate(analysis.timestamp)}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 1 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={() => viewAnalysis(analysis.analysis_id)}
                variant="outlined"
              >
                Visualiser
              </Button>
              
              <Box>
                <Tooltip title="Télécharger CSV">
                  <IconButton 
                    size="small"
                    onClick={() => downloadFile(analysis.analysis_id, 'csv')}
                    color="primary"
                  >
                    <DownloadForOfflineIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Télécharger JSON">
                  <IconButton 
                    size="small"
                    onClick={() => downloadFile(analysis.analysis_id, 'json')}
                    color="secondary"
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </CardContent>
        </StyledCard>
      </Grid>
    );
  };

  // Rendu de la liste d'analyses
  const renderAnalysisList = (analysis: Analysis, index: number) => {
    const hasAnomalies = analysis.anomalies && analysis.anomalies.length > 0;
    
    return (
      <React.Fragment key={analysis.analysis_id}>
        <ListItem 
          sx={{ 
            py: 1.5,
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: theme.palette.action.hover
            } 
          }}
        >
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1">{getAnalysisName(analysis, index)}</Typography>
                {hasAnomalies && (
                  <Tooltip title={`${analysis.anomalies?.length} anomalies détectées`}>
                    <Chip 
                      size="small" 
                      color="error" 
                      label={`${analysis.anomalies?.length} anomalies`}
                      sx={{ ml: 1 }}
                    />
                  </Tooltip>
                )}
              </Box>
            }
            secondary={
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.8rem' }} />
                <Typography variant="body2" color="text.secondary">
                  {formatDate(analysis.timestamp)}
                </Typography>
              </Box>
            }
          />
          <ListItemSecondaryAction>
            <Tooltip title="Visualiser l'analyse">
              <IconButton 
                edge="end" 
                aria-label="view"
                onClick={() => viewAnalysis(analysis.analysis_id)}
                sx={{ mr: 1 }}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Télécharger CSV">
              <IconButton 
                edge="end" 
                aria-label="download csv"
                onClick={() => downloadFile(analysis.analysis_id, 'csv')}
                sx={{ mr: 1 }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Télécharger JSON">
              <IconButton 
                edge="end" 
                aria-label="download json"
                onClick={() => downloadFile(analysis.analysis_id, 'json')}
              >
                <DownloadIcon color="primary" />
              </IconButton>
            </Tooltip>
          </ListItemSecondaryAction>
        </ListItem>
        {index < analyses.length - 1 && <Divider />}
      </React.Fragment>
    );
  };

  // Rendu du contenu du dialogue
  const renderDialogContent = () => {
    if (!selectedAnalysis) return null;

    return (
      <>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="Statistiques" 
            icon={<BarChartIcon />} 
            iconPosition="start"
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ErrorOutlineIcon sx={{ mr: 1 }} />
                Anomalies
                {selectedAnalysis.anomalies && selectedAnalysis.anomalies.length > 0 && (
                  <Chip 
                    size="small" 
                    color="error" 
                    label={selectedAnalysis.anomalies.length}
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            } 
          />
          <Tab 
            label="Informations" 
            icon={<InfoIcon />} 
            iconPosition="start" 
          />
        </Tabs>

        {currentTab === 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Analyse statistique</Typography>
            {selectedAnalysis.stats ? (
              renderStats(selectedAnalysis.stats)
            ) : (
              <Alert severity="info">Aucune statistique disponible</Alert>
            )}
          </Box>
        )}

        {currentTab === 1 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Anomalies détectées</Typography>
            {renderAnomalies(selectedAnalysis.anomalies || [])}
          </Box>
        )}

        {currentTab === 2 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Détails de l'analyse</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '30%' }}>
                      ID de l'analyse
                    </TableCell>
                    <TableCell>{selectedAnalysis.analysis_id}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Date de création
                    </TableCell>
                    <TableCell>{formatDate(selectedAnalysis.timestamp)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Fichiers disponibles
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          icon={<DownloadIcon />}
                          label="CSV"
                          onClick={() => downloadFile(selectedAnalysis.analysis_id, 'csv')}
                          color="primary"
                          variant="outlined"
                          clickable
                        />
                        <Chip
                          icon={<DownloadIcon />}
                          label="JSON"
                          onClick={() => downloadFile(selectedAnalysis.analysis_id, 'json')}
                          color="secondary"
                          variant="outlined"
                          clickable
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </>
    );
  };

  return (
    <AuthGuard>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" elevation={0} color="default" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Historique des analyses
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<RefreshIcon />}
              onClick={fetchAnalyses}
              disabled={isLoading}
              size="small"
            >
              Actualiser
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          <Paper 
            elevation={0} 
            variant="outlined"
            sx={{ 
              p: 3, 
              borderRadius: 2,
              mb: 4,
              backgroundColor: theme.palette.background.paper
            }}
          >
            <SectionHeader variant="h5" gutterBottom>
              Analyses précédentes
            </SectionHeader>

            <Tabs
              value={isMobile ? 0 : 0}
              indicatorColor="primary"
              textColor="primary"
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label={isMobile ? "Analyses" : "Toutes les analyses"} />
            </Tabs>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <CircularProgress size={40} />
              </Box>
            ) : analyses.length > 0 ? (
              isMobile ? (
                <List sx={{ bgcolor: 'background.paper' }}>
                  {analyses.map((analysis, index) => renderAnalysisList(analysis, index))}
                </List>
              ) : (
                <Grid container spacing={3}>
                  {analyses.map((analysis, index) => renderAnalysisCard(analysis, index))}
                </Grid>
              )
            ) : (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Aucune analyse disponible
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={fetchAnalyses}
                  startIcon={<RefreshIcon />}
                >
                  Actualiser
                </Button>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>

      {/* Dialogue pour afficher les détails de l'analyse */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="div" fontWeight="500">
              Détails de l'analyse
            </Typography>
            <IconButton
              aria-label="close"
              onClick={closeDialog}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {renderDialogContent()}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          {selectedAnalysis && (
            <>
              <Button 
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => downloadFile(selectedAnalysis.analysis_id, 'csv')}
              >
                CSV
              </Button>
              <Button 
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => downloadFile(selectedAnalysis.analysis_id, 'json')} 
                color="primary"
              >
                JSON
              </Button>
            </>
          )}
          <Button 
            onClick={closeDialog} 
            variant="contained" 
            color="primary"
            sx={{ ml: 2 }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </AuthGuard>
  );
}