import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, Typography, Button, Chip, Box, IconButton, DialogActions, Snackbar, Alert } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CloseIcon from '@mui/icons-material/Close';
import apiService from '../../untils/api';

interface BookDetailProps {
    id: string;
    open: boolean;
    onClose: () => void;
}

interface GenericApiResponse<T> {
    code: number;
    data: T;
    message?: string;
}

interface DocumentType {
    documentTypeId: number;
    typeName: string;
    description: string;
}

interface Book {
    documentId: number;
    documentName: string;
    isbn: string;
    author: string;
    publisher: string;
    publishedDate: string;
    pageCount: number;
    language: string | null;
    quantity: number;
    availableCount: number;
    price: number;
    maxLoanDays: number;
    status: string;
    description: string;
    documentLink: string;
    documentTypes: DocumentType[];
    coverImage: string;
}

const BookDetail: React.FC<BookDetailProps> = ({ id, open, onClose }) => {
    const [book, setBook] = useState<Book | null>(null);
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const [isBorrowed, setIsBorrowed] = useState<boolean>(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const showNotification = (type: 'success' | 'error', message: string) => {
        setSnackbarSeverity(type);
        setSnackbarMessage(message);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    useEffect(() => {
        console.log("open = ", open);
        const fetchBookDetails = async () => {
            try {
                const response = await apiService.get<GenericApiResponse<Book>>(`/api/v1/documents/${id}`);
                console.log(response);
                if (response.data.code === 1000) {
                    setBook(response.data.data);
                    console.log(response.data.data);
                } else {
                    showNotification('error', response.data.message || 'Error fetching book details');
                }
            } catch (error) {
                const typedError = error as { response?: { data?: { message?: string } } };
                console.log('Error requesting loan:', typedError.response?.data?.message || 'Unknown error');
            }
        };

        const fetchIsFavorite = async () => {
            try {
                const response = await apiService.get<GenericApiResponse<boolean>>(`/api/v1/documents/${id}/is-favorite`);
                if (response.status === 200) {
                    console.log('fetch is favo', response);
                    setIsFavorite(response.data.data);
                }
            } catch (error) {
                console.log('Error fetching favorite status:', error);
            }
        };

        const fetchIsBorrowed = async () => {
            try {
                const response = await apiService.get<GenericApiResponse<boolean>>(`/api/v1/loans/user/check-user-borrowing/${id}`);
                if (response.status === 200) {
                    console.log('fetch is borrow', response);
                    setIsBorrowed(response.data.data);
                    console.log('res', response.data.data);
                } else {
                    console.log('Error fetching borrowed status');
                }
            } catch (error) {
                console.log('Error fetching borrowed status:', error);
            }
        };

        if (open) {
            fetchBookDetails();
            fetchIsFavorite();
            fetchIsBorrowed();
        }
    }, [id, open]);

    const handleAddFavo = async () => {
        try {
            let response;
            if (!isFavorite) {
                response = await apiService.post(`/api/v1/documents/${id}/favorite`);
            } else {
                response = await apiService.delete(`/api/v1/documents/${id}/favorite`);
            }

            if (response.status === 200) {
                setIsFavorite(!isFavorite);
                showNotification('success', 'Thêm sách yêu thích thành công');
            } else {
                console.log('Lỗi thêm yêu thích');
                showNotification('error', 'Lỗi thêm yêu thích');
            }
        } catch (error) {
            const typedError = error as { response?: { data?: { message?: string } } };
            console.log('Error requesting loan:', typedError.response?.data?.message || 'Unknown error');
            showNotification('error', typedError.response?.data?.message || 'Error requesting loan');
        }
    };

    const handleViewDocumentClick = () => {
        setConfirmDialogOpen(true);
    };

    const handleConfirmLoan = async () => {
        try {
            const response = await apiService.post(`/api/v1/loans`, {
                documentId: id,
            });

            if (response.status === 200) {
                setIsBorrowed(true);
                showNotification('success', 'Đã gửi yêu cầu mượn sách');
            }
            else if (response.status === 3005) {
                console.log('abc')
            }
            else {
                console.log('Error requesting loan');
            }
        } catch (error) {
            const typedError = error as { response?: { data?: { message?: string } } };
            console.log('Error requesting loan:', typedError.response?.data?.message || 'Unknown error');
            showNotification('error', typedError.response?.data?.message || 'Error requesting loan');
        }
        finally {
            setConfirmDialogOpen(false);
        }
    };

    const handleCloseConfirmDialog = () => {
        setConfirmDialogOpen(false);
    };

    const handleReadBookClick = (bookId: number | string) => () => {
        window.open(`http://localhost:3000/read-book?id=${bookId.toString()}`);
    };

    if (!book) {
        console.log("Book in render:", book);

        return <Typography></Typography>;
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: { borderRadius: '20px' }
            }}>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{book.documentName}</Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                {!book ? (
                    <Typography>Loading...</Typography>
                ) : (
                    <Box display="flex" alignItems="flex-start">
                        {/* Ảnh bìa sách */}
                        <Box flex="0 0 200px" marginRight={2}>
                            <img
                                src={book.coverImage || 'https://via.placeholder.com/200x300'}
                                alt="cover"
                                style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                        </Box>

                        {/* Thông tin sách */}
                        <Box flex="1">
                            <Typography color="textSecondary" gutterBottom>
                                bởi {book.author}
                            </Typography>
                            <Typography variant="body2" style={{ marginTop: 8, marginBottom: 16 }}>
                                {book.description}
                            </Typography>

                            <Box marginBottom={2}>
                                <Typography variant="body2">Nhà xuất bản: {book.publisher}</Typography>
                                <Typography variant="body2">Ngày xuất bản: {book.publishedDate}</Typography>
                                <Typography variant="body2">Số trang: {book.pageCount}</Typography>
                                <Typography variant="body2">Ngôn ngữ: {book.language || 'N/A'}</Typography>
                                <Typography variant="body2">Có sẵn: {book.availableCount} bản</Typography>
                            </Box>
                            <Box display="flex" gap={1} marginTop={1} flexWrap="wrap">
                                {book.documentTypes.map((type) => (
                                    <Chip key={type.documentTypeId} label={type.typeName} />
                                ))}
                                {/* <Chip label={book.status} color="primary" /> */}
                            </Box>
                            <Box display="flex" alignItems="center" gap={2} marginTop={2}>
                                <IconButton aria-label="favorite" onClick={handleAddFavo}>
                                    {isFavorite ? (
                                        <FavoriteIcon sx={{ color: 'red' }} />
                                    ) : (
                                        <FavoriteBorderIcon />
                                    )}
                                </IconButton>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleViewDocumentClick}
                                    style={{ flex: 1, borderRadius: '20px' }}
                                    disabled={isBorrowed}
                                >
                                    Mượn sách
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={handleReadBookClick(book.documentId.toString())}
                                    style={{ flex: 1, borderRadius: '20px' }}
                                >
                                    Đọc sách
                                </Button>

                            </Box>
                        </Box>
                        <Snackbar
                            open={snackbarOpen}
                            autoHideDuration={6000}
                            onClose={handleSnackbarClose}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
                                {snackbarMessage}
                            </Alert>
                        </Snackbar>
                    </Box>)}
            </DialogContent>
            <Dialog open={confirmDialogOpen} onClose={handleCloseConfirmDialog}>
                <DialogTitle>Xác nhận yêu cầu mượn sách</DialogTitle>
                <DialogContent>
                    <Typography>Bạn có chắc chắn muốn yêu cầu mượn sách này?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDialog} color="primary">
                        Không
                    </Button>
                    <Button onClick={handleConfirmLoan} color="primary" variant="contained">
                        Có
                    </Button>
                </DialogActions>
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Dialog>
        </Dialog>
    );
};

export default BookDetail;
