import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import apiService from '../../untils/api';

interface GenericApiResponse<T> {
    code: number;
    result: T;
    message?: string;
}

interface StartSessionResponse {
    sessionId: string;
    currentPage: number;
}

const ReadBook: React.FC = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get('id');

    const [pages, setPages] = useState<{ [key: number]: string }>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMorePages, setHasMorePages] = useState(true);
    const [isEnd, setIsEnd] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        if (id && !isEnd && hasMorePages && !loading) {
            loadPage(currentPage);
        }
    }, [id, currentPage, isEnd, hasMorePages, loading]);

    // Gọi API bắt đầu session
    const startSession = async () => {
        try {
            const response = await apiService.post<GenericApiResponse<StartSessionResponse>>('/api/v1/reading-sessions/start', { documentId: id });
            console.log(response);
            if (response.status === 200 && response.data.result) {
                const { sessionId, currentPage } = response.data.result;
                setSessionId(sessionId);
                setCurrentPage(currentPage); // Lấy trang hiện tại từ API

                // Tải các trang từ 1 đến currentPage
                for (let page = 1; page <= currentPage; page++) {
                    await loadPage(page);
                }

                // Cuộn xuống trang hiện tại sau khi tải xong
                setTimeout(() => {
                    window.scrollTo({ top: document.getElementById(`page-${currentPage}`)?.offsetTop, behavior: 'smooth' });
                }, 500); // Một khoảng thời gian ngắn để đảm bảo tất cả trang đã được tải
            }
        } catch (error) {
            console.log('Error starting session:', error);
        }
    };

    // Cập nhật currentPage mỗi phút
    useEffect(() => {
        const interval = setInterval(() => {
            if (sessionId) {
                updateCurrentPage(currentPage);
            }
        }, 60000); // Gọi API mỗi 1 phút

        return () => clearInterval(interval); // Cleanup khi component unmount
    }, [currentPage, sessionId]);

    // Cập nhật currentPage qua API
    const updateCurrentPage = async (currentPage: number) => {
        try {
            const response = await apiService.put(`/api/v1/reading-sessions/${sessionId}?currentPage=${currentPage}`);
            console.log(response);
        } catch (error) {
            console.log('Error updating current page:', error);
        }
    };

    // Tải trang sách
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
                setIsEnd(true);
            }
        } catch (error) {
            console.log('Error loading page:', error);
            setHasMorePages(false);
            setIsEnd(true);
        } finally {
            setLoading(false);
        }
    };

    // Chức năng đánh dấu trang hiện tại
    const handleBookmark = async () => {
        if (sessionId) {
            try {
                // Gọi API đánh dấu trang hiện tại
                const response = await apiService.put(`/api/v1/reading-sessions/${sessionId}?currentPage=${currentPage}`);
                if (response.status === 200) {
                    alert('Đã đánh dấu trang!');
                }
            } catch (error) {
                console.log('Error bookmarking page:', error);
            }
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

    // Bắt đầu session khi component mount
    useEffect(() => {
        if (id) {
            startSession();
        }
    }, [id]);

    return (
        <Box sx={{ padding: '20px' }}>
            <Box sx={{
                position: 'fixed',
                bottom: 20,
                right: 20,
            }}>
                <IconButton onClick={handleBookmark}>
                    <BookmarkAddIcon />
                </IconButton>
            </Box>

            {Object.keys(pages).length === 0 && (
                <Typography>Loading book...</Typography>
            )}
            {Object.keys(pages).map((key) => {
                const page = parseInt(key, 10);
                const base64 = pages[page];

                return (
                    <Box key={page} id={`page-${page}`} sx={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                        {base64 ? (
                            <img
                                src={`data:image/png;base64,${base64}`}
                                alt={`Page ${page}`}
                                style={{ width: '80%', objectFit: 'contain', alignItems: 'center' }}
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
