import React, { useState, useEffect } from 'react';
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

    // Reset state when dialog is opened
    useEffect(() => {
        if (open) {
            setSelectedFile(null);
            setExcelData([]);
        }
    }, [open]);

    // Handle file change: Read file and display its content on the interface
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = new Uint8Array(event.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    setExcelData(jsonData);

                    setSnackbarMessage('File loaded successfully!');
                    setSnackbarSeverity('success');
                    setSnackbarOpen(true);
                } catch (error) {
                    console.log('Error reading file:', error);
                    setSnackbarMessage('Failed to load file. Please check the file format.');
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    // Handle file upload to the server
    const handleFileUpload = async () => {
        if (!selectedFile) {
            setSnackbarMessage('No file selected to upload!');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await apiService.post('/api/v1/program-classes/upload', formData);
            console.log('File uploaded successfully:', response);

            setSnackbarMessage('File uploaded successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            console.log('Failed to upload file:', error);
            setSnackbarMessage('Failed to upload file. Please try again.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const rows: GridRowsProp = excelData.map((item, index) => ({ id: index, ...item }));
    const columns: GridColDef[] = excelData.length > 0
        ? Object.keys(excelData[0]).map((key) => ({ field: key, headerName: key, width: 150 }))
        : [];

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
