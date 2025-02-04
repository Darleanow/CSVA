import { useState } from "react";
import {  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";


export default function FileList({ csvFiles }) {
    return (
        csvFiles.length > 0 && (
            <TableContainer component={Paper} className="mt-6 w-full max-w-2xl">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nom du fichier</TableCell>
                            <TableCell>Taille (Ko)</TableCell>
                            <TableCell>Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {csvFiles.map((file, index) => (
                            <TableRow key={index}>
                                <TableCell>{file.name}</TableCell>
                                <TableCell>{(file.size / 1024).toFixed(2)}</TableCell>
                                <TableCell>{file.date}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        )
    );
}


