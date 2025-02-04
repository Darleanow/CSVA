import { Box, Typography } from "@mui/material";

export default function FileUpload({ onDrop }) {
    const handleDrop = (event) => {
        event.preventDefault();
        onDrop(event.dataTransfer.files);

    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    return (
        <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="w-96 h-40 border-2 border-dashed border-gray-500 flex items-center justify-center bg-white rounded-lg shadow-md"
        >
            <Typography variant="body1" className="text-gray-600">Glissez-déposez un fichier CSV ici</Typography>
        </Box>
    );
}
