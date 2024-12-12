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
    Typography,
    Chip,
    Snackbar,
    Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import apiService from '../../untils/api';

interface Book {
    documentId: number;
    isbn: string;
    documentName: string;
    author: string;
    publisher: string;
    publishedDate: string;
    pageCount: number;
    language: string;
    quantity: number;
    availableCount: number;
    price: number;
    size: string;
    documentTypeIds: number[];
    courseIds: number[];
    coverImage?: string;
}

interface DocumentType {
    documentTypeId: number;
    typeName: string;
}

interface Course {
    courseId: number;
    courseName: string;
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
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourses, setSelectedCourses] = useState<number[]>([]);

    // Snackbar state
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

    useEffect(() => {
        if (documentId) {
            fetchBookDetails(documentId);
        }
        fetchDocumentTypes();
        fetchCourses();
    }, [documentId]);

    const fetchBookDetails = async (id: number) => {
        try {
            const response = await apiService.get<{ result: Book }>(`/api/v1/documents/${id}`);
            const bookData = response.data.result;
            setBook(bookData);
            setPreview(bookData.coverImage || null);
            setSelectedTags(bookData.documentTypeIds || []);
            setSelectedCourses(bookData.courseIds || []);
        } catch (error) {
            console.error('Error fetching book details:', error);
        }
    };

    const fetchDocumentTypes = async () => {
        try {
            const response = await apiService.get<{ result: { content: DocumentType[] } }>( '/api/v1/document-types');
            setDocumentTypes(response.data.result.content || []);
        } catch (error) {
            console.error('Error fetching document types:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await apiService.get<{ result: { content: Course[] } }>('/api/v1/courses');
            setCourses(response.data.result.content || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

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

    const handleTagToggle = (tagId: number) => {
        if (selectedTags.includes(tagId)) {
            setSelectedTags(selectedTags.filter((id) => id !== tagId));
        } else {
            setSelectedTags([...selectedTags, tagId]);
        }
    };

    const handleCourseToggle = (courseId: number) => {
        if (selectedCourses.includes(courseId)) {
            setSelectedCourses(selectedCourses.filter((id) => id !== courseId));
        } else {
            setSelectedCourses([...selectedCourses, courseId]);
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
            formData.append('status', 'AVAILABLE');

            selectedTags.forEach((tagId) => formData.append('documentTypeIds', tagId.toString()));
            selectedCourses.forEach((courseId) => formData.append('courseIds', courseId.toString()));

            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            await apiService.put(`/api/v1/documents/${book.documentId}`, formData);

            showSnackbar('Thông tin sách đã được cập nhật thành công!', 'success');
            onClose();
        } catch (error) {
            console.error('Error updating book:', error);
            showSnackbar('Có lỗi xảy ra khi cập nhật thông tin sách!', 'error');
        }
    };

    const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setOpenSnackbar(true);
        
        setTimeout(() => {
            setOpenSnackbar(false);
        }, 3000); // Tắt sau 3 giây
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
                                    <TextField size="small" fullWidth label="Price" name="price" type="number" value={book.price || 0} onChange={handleChange} />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                )}
                <Box mt={3}>
                    <Typography variant="h6">Select Types</Typography>
                    <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                        {documentTypes.map((tag) => (
                            <Chip
                                key={tag.documentTypeId}
                                label={tag.typeName}
                                clickable
                                color={selectedTags.includes(tag.documentTypeId) ? 'primary' : 'default'}
                                onClick={() => handleTagToggle(tag.documentTypeId)}
                            />
                        ))}
                    </Box>
                </Box>
                <Box mt={3}>
                    <Typography variant="h6">Select Courses</Typography>
                    <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                        {courses.map((course) => (
                            <Chip
                                key={course.courseId}
                                label={course.courseName}
                                clickable
                                color={selectedCourses.includes(course.courseId) ? 'primary' : 'default'}
                                onClick={() => handleCourseToggle(course.courseId)}
                            />
                        ))}
                    </Box>
                </Box>
                <Box mt={3} textAlign="center">
                    <Button variant="contained" color="primary" onClick={handleSaveChanges}>
                        Save Changes
                    </Button>
                </Box>
            </DialogContent>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Dialog>
    );
};

export default EditBookDialog;
