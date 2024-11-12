import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Grid,
    Chip,
    Avatar,
    IconButton,
} from '@mui/material';
import Sidebar from '../SideBar';
import apiService from '../../untils/api';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';


interface Book {
    isbn: string;
    documentName: string;
    author: string;
    publisher: string;
    publishedDate: string;
    pageCount: number;
    language: string;
    quantity: number;
    availableCount: number;
    status: string;
    description: string;
    coverImage: string;
    documentLink: string;
    price: number;
    size: string;
    documentTypeIds: number[];
    warehouseId: number;
}
interface DocumentType {
    documentTypeId: number;
    typeName: string;
}

interface DocumentTypeRes {
    code: number;
    message: string;
    result: {
        content: DocumentType[]
    };
}

const AddBookPage: React.FC = () => {
    const [book, setBook] = useState<Book>({
        isbn: '',
        documentName: '',
        author: '',
        publisher: '',
        publishedDate: '',
        pageCount: 0,
        language: '',
        quantity: 0,
        availableCount: 0,
        status: 'AVAILABLE',
        description: '',
        coverImage: '',
        documentLink: '',
        price: 0,
        size: 'MEDIUM',
        documentTypeIds: [],
        warehouseId: 1,
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null); // State cho PDF file
    const [preview, setPreview] = useState<string | null>(null);
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);

    useEffect(() => {
        fetchDocumentTypes();
    }, []);

    const fetchDocumentTypes = async () => {
        try {
            const response = await apiService.get<DocumentTypeRes>('/api/v1/document-types');
            setDocumentTypes(response.data.result.content || []);
            console.log(response);
        } catch (error) {
            console.error('Error fetching document types:', error);
            setDocumentTypes([]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBook({ ...book, [name]: value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file)); // Tạo URL để xem trước ảnh
        }
    };

    const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const pdfFile = e.target.files[0];
            setSelectedPdfFile(pdfFile); // Lưu PDF file vào state
        }
    };

    const handleTagToggle = (tagId: number) => {
        if (selectedTags.includes(tagId)) {
            setSelectedTags(selectedTags.filter((id) => id !== tagId));
        } else {
            setSelectedTags([...selectedTags, tagId]);
        }
    };

    const handleAddBook = async () => {
        try {
            const formData = new FormData();

            formData.append('isbn', book.isbn);
            formData.append('documentName', book.documentName);
            formData.append('author', book.author);
            formData.append('publisher', book.publisher);
            formData.append('publishedDate', book.publishedDate);
            formData.append('pageCount', book.pageCount.toString());
            formData.append('language', book.language);
            formData.append('quantity', book.quantity.toString());
            formData.append('availableCount', book.availableCount.toString());
            formData.append('status', book.status);
            formData.append('description', book.description);
            formData.append('price', book.price.toString());
            formData.append('size', book.size);
            formData.append('warehouseId', book.warehouseId.toString());

            selectedTags.forEach((tagId) => formData.append('documentTypeIds', tagId.toString()));

            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            if (selectedPdfFile) {
                formData.append('documentLink', selectedPdfFile);
            }
            const response = await apiService.post('/api/v1/documents', formData);

            console.log('Book added successfully:', response);
            alert('Book added successfully!');
        } catch (error) {
            console.error('Failed to add book:', error);
            alert('Failed to add book');
        }
    };


    return (
        <Box display="flex">
            <Sidebar />
            {/* Main Content */}
            <Box flex={1} display="flex" justifyContent="center" p={3}>
                <Paper sx={{ padding: 3, maxWidth: 1200 }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Add New Book
                    </Typography>
                    <Grid container spacing={2} justifyContent="center">
                        {/* Image Upload Section */}
                        <Grid item xs={12} sm={4}>
                            <Box
                                width={200}
                                height={300}
                                border="1px dashed #ccc"
                                borderRadius={2}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': { borderColor: '#888' },
                                    margin: '0 auto',
                                }}
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
                                    ) : (
                                        <Box display="flex" flexDirection="column" alignItems="center">
                                            <UploadFileIcon fontSize="large" color="action" />
                                            <Typography variant="caption">Upload Cover Image</Typography>
                                        </Box>
                                    )}
                                </label>
                            </Box>
                            <Typography variant="caption" sx={{ mt: 1, color: '#888', textAlign: 'center', display: 'block' }}>
                                *.jpeg, *.jpg, *.png <br /> Maximum 100 KB
                            </Typography>
                        </Grid>

                        {/* Form Section */}
                        <Grid item xs={12} sm={8}>
                            <Grid container spacing={2}>
                                {/* Các trường TextField cho thông tin sách */}
                                <Grid item xs={6}>
                                    <TextField size="small" fullWidth label="ISBN" name="isbn" value={book.isbn} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField size="small" fullWidth label="Document Name" name="documentName" value={book.documentName} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField size="small" fullWidth label="Author" name="author" value={book.author} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField size="small" fullWidth label="Publisher" name="publisher" value={book.publisher} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField size="small" fullWidth label="Published Date" name="publishedDate" type="date" InputLabelProps={{ shrink: true }} value={book.publishedDate} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField size="small" fullWidth label="Page Count" name="pageCount" type="number" value={book.pageCount} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField size="small" fullWidth label="Language" name="language" value={book.language} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField size="small" fullWidth label="Quantity" name="quantity" type="number" value={book.quantity} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField size="small" fullWidth label="Available Count" name="availableCount" type="number" value={book.availableCount} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField size="small" fullWidth label="Price" name="price" type="number" value={book.price} onChange={handleChange} />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* PDF Upload Section */}
                    <Box mt={2} textAlign="center">
                        <input
                            type="file"
                            accept="application/pdf"
                            style={{ display: 'none' }}
                            id="upload-pdf"
                            onChange={handlePdfChange}
                        />
                        <label htmlFor="upload-pdf">
                            <Button
                                variant="contained"
                                color="primary"
                                component="span"
                                startIcon={<UploadFileIcon />}
                                disabled={!!selectedPdfFile} // Vô hiệu hóa nút khi đã có file được chọn
                            >
                                Upload PDF
                            </Button>
                        </label>
                    </Box>

                    {/* Hiển thị tên PDF file và nút x để hủy chọn */}
                    {selectedPdfFile && (
                        <Box mt={2} textAlign="center" display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="body2" sx={{ marginRight: 1 }}>
                                {selectedPdfFile.name}
                            </Typography>
                            <IconButton
                                color="error"
                                size="small"
                                onClick={() => setSelectedPdfFile(null)}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    )}
                    {/* Tags Selection */}
                    <Box mt={3}>
                        <Typography variant="h6">Select Tags</Typography>
                        <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                            {(Array.isArray(documentTypes) ? documentTypes : []).map((tag) => (
                                <Chip
                                    key={tag.documentTypeId}
                                    label={tag.typeName}
                                    clickable
                                    color={selectedTags.includes(tag.documentTypeId) ? 'primary' : 'default'}
                                    onClick={() => handleTagToggle(tag.documentTypeId)}
                                    onDelete={selectedTags.includes(tag.documentTypeId) ? () => handleTagToggle(tag.documentTypeId) : undefined}
                                />
                            ))}
                        </Box>
                    </Box>
                    {/* Submit Button */}
                    <Box mt={3} textAlign="center">
                        <Button variant="contained" color="primary" onClick={handleAddBook}>
                            Add Book
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default AddBookPage;
