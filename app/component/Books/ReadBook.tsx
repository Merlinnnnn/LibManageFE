import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import apiService from '../../untils/api';

// Interface cho dữ liệu trả về từ API
interface GenericApiResponse<T> {
    code: number;
    result: T;
    message?: string;
}

const ReadBook: React.FC = () => {
    // Sử dụng URLSearchParams để lấy `id` từ URL
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get('id');

    const [pages, setPages] = useState<{ [key: number]: string }>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMorePages, setHasMorePages] = useState(true);
    const [isEnd, setIsEnd] = useState(false);

    useEffect(() => {
        if (id && !isEnd && hasMorePages && !loading) {
            loadPage(currentPage);
        }
    }, [id, currentPage, isEnd, hasMorePages, loading]);

    const loadPage = async (page: number) => {
        if (loading || pages[page] || isEnd) return;

        setLoading(true);
        try {
            const response = await apiService.get<GenericApiResponse<string>>(`/api/v1/documents/${id}/read`, {
                params: { page }
            });

            if (response.status === 200 && response.data.result) {
                const base64Data = response.data.result;
                setPages((prevPages) => ({
                    ...prevPages,
                    [page]: base64Data,
                }));
            } else {
                setHasMorePages(false);
                setIsEnd(true); // Không còn trang, đánh dấu là đã đến cuối
            }
        } catch (error) {
            console.error('Error loading page:', error);
            setHasMorePages(false);
            setIsEnd(true); // Đánh dấu là đã đến cuối do gặp lỗi
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = () => {
        const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.offsetHeight;

        // Chỉ cập nhật currentPage nếu chưa đến cuối và còn trang để tải
        if (scrollPosition / scrollHeight > 0.9 && !loading && !isEnd && hasMorePages) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [loading, isEnd, hasMorePages]);

    return (
        <Box sx={{ padding: '20px' }}>
            {Object.keys(pages).length === 0 && (
                <Typography>Loading book...</Typography>
            )}
            {Object.keys(pages).map((key) => {
                const page = parseInt(key, 10);
                const base64 = pages[page];

                return (
                    <Box key={page} sx={{ marginBottom: '20px' }}>
                        {base64 ? (
                            <img
                                src={`data:image/png;base64,${base64}`}
                                alt={`Page ${page}`}
                                style={{ width: '100%', objectFit: 'contain' }}
                            />
                        ) : (
                            <Typography>End of book reached</Typography>
                        )}
                    </Box>
                );
            })}
            {isEnd && (
                <Typography sx={{ textAlign: 'center', marginTop: '20px' }}>End of book reached</Typography>
            )}
        </Box>
    );
};

export default ReadBook;
