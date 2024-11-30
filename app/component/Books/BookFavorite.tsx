import React, { useState, useEffect } from 'react';
import { Grid, Box, Pagination, CircularProgress, Typography, Snackbar, Alert } from '@mui/material';
import BookCard from './BookCard';
import apiService from '../../untils/api';
import Header from '../Home/Header';

interface Book {
    documentId: number;
    documentName: string;
    cover?: string;
    author?: string;
    publisher?: string;
    isbn?: string;
}

interface BooksApiResponse {
    code: number;
    message: string;
    result: {
        content: Book[];
        pageNumber: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        last: boolean;
    };
}

export default function BookFavorite() {
    const [books, setBooks] = useState<Book[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    const booksPerPage = 20;

    // Hàm hiển thị snackbar
    const showSnackbar = (severity: 'success' | 'error', message: string) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            try {
                const response = await apiService.get<BooksApiResponse>(`/api/v1/documents/favorites`, {
                    params: {
                        size: booksPerPage,
                        page: currentPage,
                    },
                });
                console.log(response);
                if (response.data && response.data.result) {
                    setBooks(response.data.result.content);
                    setTotalPages(response.data.result.totalPages);
                    showSnackbar('success', 'Books loaded successfully!');
                } else {
                    setBooks([]);
                    setTotalPages(1);
                    showSnackbar('error', 'No data found.');
                }
            } catch (error) {
                console.log('Không thể tải sách:', error);
                setBooks([]);
                showSnackbar('error', 'Failed to load books.');
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, [currentPage]);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <Box sx={{ padding: '20px' }} suppressHydrationWarning>
            <Header />
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                    <CircularProgress />
                </Box>
            ) : books.length > 0 ? (
                <>
                    <Grid container spacing={2} justifyContent="center" sx={{ marginTop: '20px' }}>
                        {books.map((book) => (
                            <Grid item key={book.documentId}>
                                <BookCard
                                    book={book}
                                    onViewDocument={() => {
                                        console.log(`Viewing document ID: ${book.documentId}`);
                                    }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>
                </>
            ) : (
                <Typography variant="h6" align="center" sx={{ marginTop: '20px' }}>
                    No data found.
                </Typography>
            )}

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
        </Box>
    );
}
