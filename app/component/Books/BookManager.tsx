import React, { useState, useEffect } from 'react';
import { Grid, Box, Pagination, CircularProgress, Typography, Drawer } from '@mui/material';
import BookCard from './BookCard';
import apiService from '../../untils/api';
import Header from '../Home/Header';
import Sidebar from '../SideBar';

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

export default function BookShelf() {
    const [books, setBooks] = useState<Book[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const booksPerPage = 20;

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            try {
                const response = await apiService.get<BooksApiResponse>(`/api/v1/documents`, {
                    params: {
                        size: booksPerPage,
                        page: currentPage,
                    },
                });
                console.log(response);
                if (response.data && response.data.result) {
                    setBooks(response.data.result.content);
                    console.log(response.data.result.content);
                    setTotalPages(response.data.result.totalPages);
                } else {
                    setBooks([]);
                    setTotalPages(1);
                }
            } catch (error) {
                console.error('Không thể tải sách:', error);
                setBooks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, [currentPage]);

    // Khi người dùng chuyển trang trên giao diện
    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        // Pagination của Material UI bắt đầu từ 1, cần điều chỉnh thành 0 để phù hợp với backend
        setCurrentPage(value - 1);
    };

    return (
        <Box display="flex" flexDirection="row" sx={{ height: '100vh' }}>
            
            <Sidebar/>

            {/* Nội dung chính hiển thị danh sách sách */}
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
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
                                page={currentPage + 1} // Chuyển đổi `currentPage` từ backend để phù hợp với Pagination (bắt đầu từ 1)
                                onChange={handlePageChange}
                                color="primary"
                            />
                        </Box>
                    </>
                ) : (
                    <Typography variant="h6" align="center" sx={{ marginTop: '20px' }}>
                        No data be find.
                    </Typography>
                )}
            </Box>
        </Box>
    );
}
