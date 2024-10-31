import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Button, Chip, Box } from '@mui/material';
import apiService from '../../untils/api';

interface BookDetailProps {
    id: string;
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

const BookDetail: React.FC<BookDetailProps> = ({ id }) => {
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

        fetchBookDetails();
    }, [id]);

    if (!book) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box display="flex" justifyContent="center" padding={2}>
            <Card style={{ maxWidth: 400, width: '100%' }}>
                <img
                    src="https://example.com/path/to/cover-image.jpg"
                    alt="cover"
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
                <CardContent>
                    <Typography variant="h5" component="div" style={{ fontWeight: 'bold', marginTop: 8 }}>
                        {book.documentName}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                        by {book.author}
                    </Typography>
                    <Typography variant="body2" style={{ marginTop: 8, marginBottom: 16 }}>
                        {book.description}
                    </Typography>

                    <Box display="flex" flexWrap="wrap" gap={1} marginBottom={2}>
                        <Chip label={book.documentTypeName} />
                        <Chip label={book.status} color="primary" />
                    </Box>

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
                </CardContent>
            </Card>
        </Box>
    );
};

export default BookDetail;
