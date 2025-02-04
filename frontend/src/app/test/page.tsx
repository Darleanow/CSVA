"use client";

import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import FileUpload from "../components/fileUpload";
import FileList from "../components/fileList";

interface CsvFile {
    name: string;
    size: number;
    date: string;
}

export default function Home() {
    const [csvFiles, setCsvFiles] = useState<CsvFile[]>([]);

    useEffect(() => {
        fetch("/api/csv")
            .then((response) => response.json())
            .then((data: CsvFile[]) => setCsvFiles(data));
    }, []);

    const handleFiles = async (files: FileList) => {
        const csvFilesOnly = Array.from(files).filter(file => file.type === "text/csv" || file.name.endsWith(".csv"));
        if (csvFilesOnly.length > 0) {
            const formData = new FormData();
            csvFilesOnly.forEach(file => formData.append("file", file));

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const newFile: CsvFile = await response.json();
                setCsvFiles(prev => [...prev, newFile]);
            }
        }
    };


    return (
        <div className="min-h-screen flex flex-col items-center p-10 bg-gray-100">
            <Typography variant="h4" className="mb-6">Uploader un fichier CSV</Typography>
            <FileUpload onDrop={handleFiles} />
            <FileList csvFiles={csvFiles} />
        </div>
    );
}