import { useState, useRef } from "react";
import { Box, Typography, Snackbar, Alert } from "@mui/material";

interface FileUploadProps {
    onDrop: (files: FileList) => Promise<void>;
}

export default function FileUpload({ onDrop }: FileUploadProps) {
    const [message, setMessage] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const [severity, setSeverity] = useState<"success" | "error">("success");
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        try {
            await handleFiles(event.dataTransfer.files);
        } catch (error) {
            setMessage("Erreur lors du dépôt des fichiers");
            setSeverity("error");
            setOpen(true);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleFiles = async (files: FileList) => {
        const csvFiles = Array.from(files).filter(file => 
            file.type === "text/csv" || file.name.endsWith(".csv")
        );

        if (csvFiles.length === 0) {
            setMessage("Seuls les fichiers CSV sont acceptés");
            setSeverity("error");
            setOpen(true);
            return;
        }

        try {
            await onDrop(files);
            setMessage("Upload réussi !");
            setSeverity("success");
        } catch (error) {
            setMessage("Erreur lors de l'upload");
            setSeverity("error");
        } finally {
            setOpen(true);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            try {
                await handleFiles(event.target.files);
            } catch (error) {
                setMessage("Erreur lors de la sélection des fichiers");
                setSeverity("error");
                setOpen(true);
            }
        }
    };

    const handleClose = () => setOpen(false);

    return (
        <div className="flex flex-col items-center w-full max-w-2xl">
            <Box
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    w-full h-40 border-2 border-dashed 
                    flex items-center justify-center 
                    rounded-lg shadow-md cursor-pointer 
                    transition-colors duration-200
                    ${isDragging 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-500 bg-white"
                    }
                `}
            >
                <Typography variant="body1" className="text-gray-600 text-center px-4">
                    {isDragging
                        ? "Déposez votre fichier CSV ici"
                        : "Glissez-déposez ou cliquez pour sélectionner un fichier CSV"
                    }
                </Typography>
                <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                />
            </Box>
            <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </div>
    );
}
