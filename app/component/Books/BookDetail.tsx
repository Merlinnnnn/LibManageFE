import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, Typography, Button, Chip, Box, IconButton, DialogActions, Snackbar, Alert, CircularProgress, Stack } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
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
    const [book, setBook] = useState<any>(null);
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const [isBorrowed, setIsBorrowed] = useState<boolean>(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const [loading, setLoading] = useState(false);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setSnackbarSeverity(type);
        setSnackbarMessage(message);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    useEffect(() => {
        if (open) {
            setLoading(true);
            apiService.get(`/api/v1/documents/${id}`)
                .then((response: any) => {
                    const data = response.data as any;
                    if (data.code === 1000) {
                        setBook(data.data);
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [id, open]);

    useEffect(() => {
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

    // Determine type label
    let typeLabel = '';
    if (book?.physicalDocument && book?.digitalDocument) typeLabel = 'Sách giấy & điện tử';
    else if (book?.physicalDocument) typeLabel = 'Sách giấy';
    else if (book?.digitalDocument) typeLabel = 'Sách điện tử';

    // Loading dialog
    if (loading || !book) {
        return (
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '20px' } }}>
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={300}>
                    <CircularProgress color="primary" />
                    <Typography sx={{ mt: 2 }}>Đang tải thông tin sách...</Typography>
                </Box>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: '20px', p: 0, background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)' } }}>
            <DialogTitle sx={{ p: 0 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" px={4} pt={3} pb={1}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: 0.5 }}>{book.documentName}</Typography>
                    <IconButton onClick={onClose} sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: { xs: 2, sm: 4 } }}>
                <Box display={{ xs: 'block', md: 'flex' }} alignItems="flex-start" gap={4}>
                    {/* Cover */}
                    <Box flex="0 0 220px" mb={{ xs: 3, md: 0 }} mx={{ xs: 'auto', md: 0 }}>
                        <Box sx={{
                            width: 220,
                            height: 320,
                            borderRadius: 4,
                            overflow: 'hidden',
                            boxShadow: 4,
                            mx: 'auto',
                            background: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <img
                                src={book.coverImage || 'https://via.placeholder.com/220x320'}
                                alt="cover"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                            />
                        </Box>
                        <Chip
                            label={typeLabel}
                            color={typeLabel === 'Sách giấy' ? 'primary' : typeLabel === 'Sách điện tử' ? 'success' : 'secondary'}
                            sx={{ mt: 2, fontWeight: 600, fontSize: 15, px: 2, py: 1, borderRadius: 2, boxShadow: 1 }}
                        />
                    </Box>
                    {/* Info */}
                    <Box flex={1}>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                            Tác giả: <span style={{ color: '#222', fontWeight: 600 }}>{book.author}</span>
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                            Nhà xuất bản: <span style={{ color: '#222', fontWeight: 600 }}>{book.publisher}</span>
                        </Typography>
                        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
                            {book.documentTypes?.map((type: any) => (
                                <Chip key={type.documentTypeId} label={type.typeName} size="medium" color="info" sx={{ fontWeight: 500, borderRadius: 2, mb: 1 }} />
                            ))}
                        </Stack>
                        <Typography variant="body1" sx={{ mb: 3, color: 'text.primary', fontSize: 17, lineHeight: 1.7 }}>
                            {book.description}
                        </Typography>
                        {/* Digital */}
                        {book.digitalDocument && (
                            <Box mb={2}>
                                <Typography fontWeight={600} mb={1} color="primary.main">Tài liệu điện tử:</Typography>
                                {book.digitalDocument.uploads?.map((file: any) => {
                                    if (file.fileType === 'application/pdf' || file.fileType === 'pdf') {
                                        return (
                                            <Chip
                                                key={file.uploadId}
                                                icon={<PictureAsPdfIcon />}
                                                label="PDF"
                                                color="error"
                                                variant="outlined"
                                                sx={{ borderRadius: '10px', mr: 1, mb: 1, fontWeight: 500, fontSize: 15, '& .MuiChip-icon': { color: 'error.main' } }}
                                            />
                                        );
                                    }
                                    if (
                                        file.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                                        file.fileType === 'application/msword' ||
                                        file.fileType === 'docx' ||
                                        file.fileType === 'doc'
                                    ) {
                                        return (
                                            <Chip
                                                key={file.uploadId}
                                                icon={<DescriptionIcon />}
                                                label="Word"
                                                color="primary"
                                                variant="outlined"
                                                sx={{ borderRadius: '10px', mr: 1, mb: 1, fontWeight: 500, fontSize: 15, '& .MuiChip-icon': { color: 'primary.main' } }}
                                            />
                                        );
                                    }
                                    return null;
                                })}
                            </Box>
                        )}
                        {/* Physical */}
                        {book.physicalDocument && (
                            <Box mb={2}>
                                <Typography fontWeight={600} mb={1} color="primary.main">Tài liệu giấy:</Typography>
                                <Typography variant="body2">Số lượng: <b>{book.physicalDocument.quantity}</b></Typography>
                                <Typography variant="body2">Còn lại: <b>{book.physicalDocument.availableCopies}</b></Typography>
                            </Box>
                        )}
                        {/* Borrow button */}
                        <Box display="flex" alignItems="center" gap={2} mt={3}>
                            <IconButton aria-label="favorite" onClick={handleAddFavo} sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'pink.100' } }}>
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
                                sx={{ flex: 1, borderRadius: '30px', fontWeight: 700, fontSize: 17, py: 1.2, boxShadow: 2, textTransform: 'none', letterSpacing: 0.5 }}
                                disabled={isBorrowed}
                            >
                                Mượn sách
                            </Button>
                        </Box>
                    </Box>
                </Box>
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
