import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    TextField,
    Box,
    Button,
    Avatar,
    IconButton,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import apiService from '../../untils/api';

interface Book {
    documentId: number;
    documentName: string;
    coverImage?: string;
    author?: string;
    publisher?: string;
    isbn?: string;
    publishedDate?: string;
    pageCount?: number;
    language?: string;
    quantity?: number;
    availableCount?: number;
    status?: string;
    description?: string;
    price?: number;
    size?: string;
    documentTypeIds?: number[];
    warehouseId?: number;
}

interface EditBookDialogProps {
    open: boolean;
    documentId: number;
    onClose: () => void;
}

const EditBookDialog: React.FC<EditBookDialogProps> = ({ open, documentId, onClose }) => {
    const [book, setBook] = useState<Book | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (documentId) {
            const fetchBook = async () => {
                try {
                    const response = await apiService.get<{ code: number; message: string; result: Book }>(`/api/v1/documents/${documentId}`);
                    setBook(response.data.result);
                    setPreview(`${response.data.result.coverImage}`);
                } catch (error) {
                    console.error('Không thể tải thông tin sách:', error);
                }
            };
            fetchBook();
        }
    }, [documentId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!book) return;
        const { name, value } = e.target;
        setBook({ ...book, [name]: value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveChanges = async () => {
        if (!book) return;

        try {
            const formData = new FormData();

            formData.append('isbn', book.isbn || '');
            formData.append('documentName', book.documentName || '');
            formData.append('author', book.author || '');
            formData.append('publisher', book.publisher || '');
            formData.append('publishedDate', book.publishedDate || '');
            formData.append('pageCount', (book.pageCount || 0).toString());
            formData.append('language', book.language || '');
            formData.append('quantity', (book.quantity || 0).toString());
            formData.append('availableCount', (book.availableCount || 0).toString());
            formData.append('price', (book.price || 0).toString());
            formData.append('size', book.size || '');
            formData.append('warehouseId', (book.warehouseId || 0).toString());
            const documentTypeIds = [1, 2, 3]; 

            documentTypeIds.forEach((id) => {
                formData.append('documentTypeIds', id.toString());
            });
            
            formData.append('warehouseId','AVAILABLE');

            // if (selectedFile) {
            //     formData.append('coverImage', selectedFile); 
            // }
            const jsonData: Record<string, any> = {};
            formData.forEach((value, key) => {
                jsonData[key] = value;
            });
            await apiService.put(`/api/v1/documents/${book.documentId}`, jsonData);

            alert('Book information updated successfully!');
            onClose();
        } catch (error) {
            console.error('Không thể cập nhật sách:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Edit Book Information
                <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {book && (
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <Box
                                width={200}
                                height={300}
                                border="1px dashed #ccc"
                                borderRadius={2}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                sx={{ cursor: 'pointer', margin: '0 auto' }}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="upload-avatar"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="upload-avatar">
                                    {preview ? (
                                        <Avatar
                                            src={preview}
                                            alt="Selected File"
                                            sx={{ width: '100%', height: '100%', borderRadius: 1 }}
                                        />
                                    ) : book?.coverImage ? (
                                        <Avatar
                                            src={book.coverImage}
                                            alt="Book Cover"
                                            sx={{ width: '100%', height: '100%', borderRadius: 1 }}
                                            onError={(e: any) => {
                                                e.target.onerror = null;
                                                e.target.src = '';
                                            }}
                                        />
                                    ) : (

                                        <Box
                                            display="flex"
                                            flexDirection="column"
                                            alignItems="center"
                                            justifyContent="center"
                                            width="100%"
                                            height="100%"
                                        >
                                            <UploadFileIcon fontSize="large" color="action" />
                                            <Typography variant="caption">Upload Cover Image</Typography>
                                        </Box>
                                    )}
                                </label>
                            </Box>
                        </Grid>



                        {/* Form Section */}
                        <Grid item xs={12} sm={8}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField size="small" fullWidth label="ISBN" name="isbn" value={book.isbn || ''} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField size="small" fullWidth label="Document Name" name="documentName" value={book.documentName || ''} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField size="small" fullWidth label="Author" name="author" value={book.author || ''} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField size="small" fullWidth label="Publisher" name="publisher" value={book.publisher || ''} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField size="small" fullWidth label="Published Date" name="publishedDate" type="date" InputLabelProps={{ shrink: true }} value={book.publishedDate || ''} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField size="small" fullWidth label="Page Count" name="pageCount" type="number" value={book.pageCount || 0} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField size="small" fullWidth label="Language" name="language" value={book.language || ''} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField size="small" fullWidth label="Quantity" name="quantity" type="number" value={book.quantity || 0} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField size="small" fullWidth label="Available Count" name="availableCount" type="number" value={book.availableCount || 0} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField size="small" fullWidth label="Price" name="price" type="number" value={book.price || 0} onChange={handleChange} />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                )}
                <Box mt={3} textAlign="center">
                    <Button variant="contained" color="primary" onClick={handleSaveChanges}>
                        Save Changes
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default EditBookDialog;
