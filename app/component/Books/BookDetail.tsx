// BookDetail.tsx
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, Typography, Button, Chip, Box } from '@mui/material';
import apiService from '../../untils/api';

interface BookDetailProps {
    id: string;
    open: boolean;
    onClose: () => void;
}

interface ApiResponse {
    code: number;
    result: Book;
    message?: string;
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
    documentTypeName: string;
}

const BookDetail: React.FC<BookDetailProps> = ({ id, open, onClose }) => {
    const [book, setBook] = useState<Book | null>(null);

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const response = await apiService.get<ApiResponse>(`/api/v1/documents/${id}`);
                if (response.data.code === 1000) {
                    setBook(response.data.result);
                } else {
                    console.error('Error fetching book details:', response.data.message);
                }
            } catch (error) {
                console.error('Error fetching book details:', error);
            }
        };

        if (open) {
            fetchBookDetails();
        }
    }, [id, open]);

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
                        <Box display="flex" gap={1} marginTop={1}>
                            <Chip label={book.documentTypeName} />
                            <Chip label={book.status} color="primary" />
                        </Box>
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
                            <Typography variant="body2">ISBN: {book.isbn}</Typography>
                            <Typography variant="body2">Page Count: {book.pageCount}</Typography>
                            <Typography variant="body2">Language: {book.language || 'N/A'}</Typography>
                            <Typography variant="body2">Price: {book.price} VND</Typography>
                            <Typography variant="body2">Available: {book.availableCount} copies</Typography>
                            <Typography variant="body2">Max Loan Days: {book.maxLoanDays}</Typography>
                        </Box>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => window.open(book.documentLink, '_blank')}
                            fullWidth
                        >
                            View Document
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default BookDetail;
