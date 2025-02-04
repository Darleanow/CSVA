import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper,
    IconButton,
    Tooltip 
} from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';

interface CsvFile {
    name: string;
    size: number;
    date: string;
    url: string;
}

interface FileListProps {
    csvFiles: CsvFile[];
}

export default function FileList({ csvFiles }: FileListProps) {
    const handleDownload = (file: CsvFile) => {
        window.open(file.url, '_blank');
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        csvFiles.length > 0 && (
            <TableContainer component={Paper} className="mt-6 w-full max-w-2xl shadow-md">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nom du fichier</TableCell>
                            <TableCell>Taille</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell align="center">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {csvFiles.map((file, index) => (
                            <TableRow 
                                key={index}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {file.name}
                                </TableCell>
                                <TableCell>{formatFileSize(file.size)}</TableCell>
                                <TableCell>{file.date}</TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Télécharger">
                                        <IconButton 
                                            onClick={() => handleDownload(file)}
                                            color="primary"
                                            size="small"
                                        >
                                            <DownloadIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        )
    );
}
