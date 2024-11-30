import React, { useState } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    Box,
    Snackbar,
    Alert,
} from '@mui/material';
import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import * as XLSX from 'xlsx';
import apiService from '../../untils/api';

interface ImportExcelDialogProps {
    open: boolean;
    onClose: () => void;
}

const ImportExcelDialog: React.FC<ImportExcelDialogProps> = ({ open, onClose }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [excelData, setExcelData] = useState<any[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    // Handle file change (selecting an excel file)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // Handle file upload to the server and reading data
    const handleFileUpload = async () => {
        if (!selectedFile) return;

        // Send request to upload the file
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await apiService.post('/api/v1/program-classes/upload', formData);
            console.log('File uploaded successfully:', response);

            // Read file data using xlsx
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                setExcelData(jsonData);
            };
            reader.readAsArrayBuffer(selectedFile);

            // Show success notification
            setSnackbarMessage('File uploaded and data loaded successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Failed to upload file:', error);
            setSnackbarMessage('Failed to upload file. Please try again.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const rows: GridRowsProp = excelData.map((item, index) => ({ id: index, ...item }));
    const columns: GridColDef[] = excelData.length > 0
        ? Object.keys(excelData[0]).map((key) => ({ field: key, headerName: key, width: 150 }))
        : [];

    // Close snackbar
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Import Excel File</DialogTitle>
            <DialogContent>
                <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
                {excelData.length > 0 && (
                    <Box mt={2}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            pageSizeOptions={[5]}
                            autoHeight
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleFileUpload} color="primary" variant="contained">
                    Upload
                </Button>
            </DialogActions>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Dialog>
    );
};

export default ImportExcelDialog;
