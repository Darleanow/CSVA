"use client";

import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import FileUpload from "../components/file-upload";
import FileList from "../components/file-list";
import { useAuth } from "../context/auth-context";
import { getStorage, ref, uploadBytes, listAll, getDownloadURL, getMetadata } from "firebase/storage";

interface CsvFile {
    name: string;
    size: number;
    date: string;
    url: string;
    path: string;
}

export default function Home() {
    const [csvFiles, setCsvFiles] = useState<CsvFile[]>([]);
    const { user } = useAuth();
    const storage = getStorage();

    useEffect(() => {
        if (!user) return;
        
        const loadFiles = async () => {
            const userFolderRef = ref(storage, `csvFiles/${user.uid}`);
            
            try {
                const filesList = await listAll(userFolderRef);
                const filesData = await Promise.all(
                    filesList.items.map(async (fileRef) => {
                        const [metadata, url] = await Promise.all([
                            getMetadata(fileRef),
                            getDownloadURL(fileRef)
                        ]);
                        
                        return {
                            name: fileRef.name,
                            size: metadata.size,
                            date: new Date(metadata.timeCreated).toLocaleString(),
                            url: url,
                            path: fileRef.fullPath
                        };
                    })
                );
                
                setCsvFiles(filesData);
            } catch (error) {
                console.error("Erreur lors du chargement des fichiers:", error);
            }
        };

        loadFiles();
    }, [user, storage]);

    const handleFiles = async (files: FileList) => {
        if (!user) return;

        const csvFilesOnly = Array.from(files).filter(file => 
            file.type === "text/csv" || file.name.endsWith(".csv")
        );

        for (const file of csvFilesOnly) {
            try {
                const fileRef = ref(storage, `csvFiles/${user.uid}/${file.name}`);
                await uploadBytes(fileRef, file);
                
                const [metadata, url] = await Promise.all([
                    getMetadata(fileRef),
                    getDownloadURL(fileRef)
                ]);

                const newFile: CsvFile = {
                    name: file.name,
                    size: metadata.size,
                    date: new Date(metadata.timeCreated).toLocaleString(),
                    url: url,
                    path: fileRef.fullPath
                };

                setCsvFiles(prev => [...prev, newFile]);
            } catch (error) {
                console.error("Erreur lors de l'upload:", error);
            }
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Typography variant="h5">Veuillez vous connecter pour accéder à cette page</Typography>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center p-10 bg-gray-100">
            <Typography variant="h4" className="mb-6">Uploader un fichier CSV</Typography>
            <FileUpload onDrop={handleFiles} />
            <FileList csvFiles={csvFiles} />
        </div>
    );
}
