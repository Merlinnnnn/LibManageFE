import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, Typography, Button, Chip, Box, IconButton, DialogActions } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import apiService from '../../untils/api';

interface BookDetailProps {
    id: string;
    open: boolean;
    onClose: () => void;
}

interface GenericApiResponse<T> {
    code: number;
    result: T;
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

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const response = await apiService.get<GenericApiResponse<Book>>(`/api/v1/documents/${id}`);
                if (response.data.code === 1000) {
                    setBook(response.data.result);
                    console.log(response.data.result);
                } else {
                    console.error('Error fetching book details:', response.data.message);
                }
            } catch (error) {
                console.error('Error fetching book details:', error);
            }
        };

        const fetchIsFavorite = async () => {
            try {
                const response = await apiService.get<GenericApiResponse<boolean>>(`/api/v1/documents/${id}/is-favorite`);
                if (response.status === 200) {
                    console.log('fetch is favo', response);
                    setIsFavorite(response.data.result);
                }
            } catch (error) {
                console.error('Error fetching favorite status:', error);
            }
        };

        const fetchIsBorrowed = async () => {
            try {
                const response = await apiService.get<GenericApiResponse<boolean>>(`/api/v1/loan-transactions/user/check-user-borrowing/${id}`);
                if (response.status === 200) {
                    console.log('fetch is borrow', response);
                    setIsBorrowed(response.data.result);
                } else {
                    console.error('Error fetching borrowed status');
                }
            } catch (error) {
                console.error('Error fetching borrowed status:', error);
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
            } else {
                console.error('Error updating favorite status');
            }
        } catch (error) {
            console.error('Error updating favorite status:', error);
        }
    };

    const handleViewDocumentClick = () => {
        setConfirmDialogOpen(true);
    };

    const handleConfirmLoan = async () => {
        try {
            const response = await apiService.post(`/api/v1/loan-transactions`, {
                documentId: id,
            });

            if (response.status === 200) {
                setIsBorrowed(true);
            } else {
                console.error('Error requesting loan');
            }
        } catch (error) {
            console.error('Error requesting loan:', error);
        } finally {
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
        return <Typography>Loading...</Typography>;
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{book.documentName}</DialogTitle>
            <DialogContent>
                <Box display="flex" alignItems="flex-start">
                    {/* Ảnh bìa sách */}
                    <Box flex="0 0 200px" marginRight={2}>
                        <img
                            src={book.documentLink || 'https://via.placeholder.com/200x300'}
                            alt="cover"
                            style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                    </Box>

                    {/* Thông tin sách */}
                    <Box flex="1">
                        <Typography color="textSecondary" gutterBottom>
                            by {book.author}
                        </Typography>
                        <Typography variant="body2" style={{ marginTop: 8, marginBottom: 16 }}>
                            {book.description}
                        </Typography>

                        <Box marginBottom={2}>
                            <Typography variant="body2">Publisher: {book.publisher}</Typography>
                            <Typography variant="body2">Published Date: {book.publishedDate}</Typography>
                            <Typography variant="body2">Page Count: {book.pageCount}</Typography>
                            <Typography variant="body2">Language: {book.language || 'N/A'}</Typography>
                            <Typography variant="body2">Available: {book.availableCount} copies</Typography>
                        </Box>
                        <Box display="flex" gap={1} marginTop={1} flexWrap="wrap">
                            {book.documentTypes.map((type) => (
                                <Chip key={type.documentTypeId} label={type.typeName} />
                            ))}
                            <Chip label={book.status} color="primary" />
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
                                style={{ flex: 1 }}
                                disabled={isBorrowed}
                            >
                                Borrow Book
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleReadBookClick(book.documentId.toString())} // Ép kiểu thành chuỗi
                                style={{ flex: 1 }}
                            >
                                Read Book
                            </Button>

                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            <Dialog open={confirmDialogOpen} onClose={handleCloseConfirmDialog}>
                <DialogTitle>Confirm Loan Request</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to request a loan for this book?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDialog} color="primary">
                        No
                    </Button>
                    <Button onClick={handleConfirmLoan} color="primary" variant="contained">
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    );
};

export default BookDetail;
