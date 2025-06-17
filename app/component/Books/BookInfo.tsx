import React, { useEffect, useState } from 'react';
import { 
    Card, 
    CardContent, 
    CardMedia, 
    Typography, 
    Box, 
    CircularProgress, 
    Alert, 
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Chip,
    Snackbar
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import CloseIcon from '@mui/icons-material/Close';
import apiService from '../../untils/api';

interface BookInfoProps {
    id: string;
    books: Book[] | undefined;
    onTitleClick?: (id: string) => void;
}

interface GenericApiResponse<T> {
    code: number;
    data: T;
    message?: string;
}

interface Upload {
    uploadId: number;
    fileName: string;
    fileType: string;
    filePath: string;
    uploadedAt: string;
}

interface DigitalDocument {
    digitalDocumentId: number;
    documentName: string;
    author: string;
    publisher: string;
    description: string;
    coverImage: string | null;
    uploads: Upload[];
    visibilityStatus?: string;
}

interface FavoriteRes {
    data: {
        code: number;
        data: boolean;
        message: string;
        success: boolean;
    };
    status: boolean;
}

interface DocumentType {
    documentTypeId: number;
    typeName: string;
    description: string;
}

interface Course {
    courseId: number;
    courseCode: string;
    courseName: string;
    description: string;
}

interface PhysicalDocument {
    physicalDocumentId: number;
    documentName: string;
    author: string;
    publisher: string;
    description: string;
    coverImage: string | null;
    isbn: string;
    quantity: number;
    borrowedCount: number;
    unavailableCount: number;
    availableCopies: number;
}

interface Book {
    documentId: number;
    documentName: string;
    author: string;
    publisher: string;
    publishedDate: string | null;
    language: string | null;
    quantity: number;
    description: string;
    coverImage: string | null;
    documentCategory: string;
    documentTypes: DocumentType[];
    courses: Course[];
    physicalDocument: PhysicalDocument | null;
    digitalDocument: {
        digitalDocumentId: number;
        documentName: string;
        author: string;
        publisher: string;
        description: string;
        coverImage: string | null;
        uploads: Upload[];
    } | null;
}

const BookInfo: React.FC<BookInfoProps> = ({ id, books, onTitleClick }) => {
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const [hasPdf, setHasPdf] = useState<boolean>(false);
    const [hasWord, setHasWord] = useState<boolean>(false);
    const [hasMp4, setHasMp4] = useState<boolean>(false);
    const [pdfUrl, setPdfUrl] = useState<string>('');
    const [wordUrl, setWordUrl] = useState<string>('');
    const [mp4Url, setMp4Url] = useState<string>('');
    const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
    const [borrowType, setBorrowType] = useState<'physical' | 'digital' | null>(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

    useEffect(() => {
        if (!books) return;
        console.log('books', books);
        checkFavor(id);
        const foundBook = books.find((b) => b?.documentId?.toString() === id);
        if (foundBook) {
            setBook(foundBook);
            
            // Check for file types if it's a digital document
            if (foundBook.documentCategory === 'DIGITAL' && foundBook.digitalDocument?.uploads) {
                const digitalDoc = foundBook.digitalDocument;
                if (digitalDoc) {
                    digitalDoc.uploads.forEach((upload) => {
                        if (upload.fileType === 'application/pdf' || upload.fileType === 'pdf') {
                            setHasPdf(true);
                            setPdfUrl(upload.filePath);
                        } else if (upload.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                                 upload.fileType === 'application/msword' || 
                                 upload.fileType === 'docx') {
                            setHasWord(true);
                            setWordUrl(upload.filePath);
                        }
                    });
                }
            }
        }
    }, [id, books]);

    const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setOpenSnackbar(true);

        setTimeout(() => {
            setOpenSnackbar(false);
        }, 3000);
    };

    const handleToggleFavorite = async () => {
        try {
            let response;
            if (!isFavorite) {
                response = await apiService.post(`/api/v1/documents/${id}/favorite`);
                showSnackbar('Đã thêm vào danh sách yêu thích!', 'success');
            } else {
                response = await apiService.delete(`/api/v1/documents/${id}/favorite`);
                showSnackbar('Đã xóa khỏi danh sách yêu thích!', 'success');
            }

            if (response.status === 200) {
                setIsFavorite(!isFavorite);
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái yêu thích:', error);
            showSnackbar('Có lỗi xảy ra khi cập nhật trạng thái yêu thích!', 'error');
        }
    };

    const checkFavor = async (id: string) => {
        try {
            const res = await apiService.get<FavoriteRes>(`/api/v1/favorites/${id}`)
            console.log(res.data.data + id);
            if (res.data.data) {
                setIsFavorite(true);
            } else {
                setIsFavorite(false);
            }

        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái yêu thích:', error);
        }
    };

    const handleFileOpen = (fileUrl: string) => {
        if (!book?.digitalDocument?.digitalDocumentId) return;
        const formattedUrl = fileUrl.replace(/\\/g, '/');
        window.open(`/api/v1/digital-documents/${book.digitalDocument.digitalDocumentId}/download?filePath=${encodeURIComponent(formattedUrl)}`, '_blank');
    };

    const handleBorrowClick = () => {
        setBorrowType(null);
        setBorrowDialogOpen(true);
    };

    const handleBorrowConfirm = async () => {
        try {
            if (book?.documentCategory === 'BOTH' && !borrowType) return;
            
            if (book?.documentCategory === 'DIGITAL' || (book?.documentCategory === 'BOTH' && borrowType === 'digital')) {
                if (book?.digitalDocument?.digitalDocumentId) {
                    const payload = {
                        digitalId: book.digitalDocument.digitalDocumentId
                    };
                    const res = await apiService.post('/api/v1/access-requests', payload);
                    showSnackbar('Yêu cầu mượn sách điện tử đã được gửi thành công!', 'success');
                }
            } else if (book?.documentCategory === 'PHYSICAL' || (book?.documentCategory === 'BOTH' && borrowType === 'physical')) {
                const payload = {
                    physicalDocId: book.physicalDocument?.physicalDocumentId,
                };
                const res = await apiService.post('/api/v1/loans', payload);
                showSnackbar('Yêu cầu mượn sách vật lý đã được gửi thành công!', 'success');
            }
            setBorrowDialogOpen(false);
            setBorrowType(null);
        } catch (error: any) {
            console.error('Lỗi khi mượn sách:', error.response?.data?.message );
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu mượn sách!';
            showSnackbar(errorMessage, 'error');
        }
    };
    

    const handleBorrowCancel = () => {
        setBorrowDialogOpen(false);
        setBorrowType(null);
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (!book) {
        return <Typography variant="body1">Không có thông tin sách.</Typography>;
    }

    return (
        <>
            <Card sx={{ display: 'flex', boxShadow: 3, p: 2, width: '100%', borderRadius: '20px', overflow: 'hidden', position: 'relative', minHeight: 260, height: '100%' }}>
                {/* Ảnh bìa */}
                <CardMedia
                    component="img"
                    sx={{ 
                        width: 150, 
                        height: 200, 
                        objectFit: 'cover', 
                        bgcolor: '#f5f5f5',
                        borderRadius: '20px'
                    }}
                    image={book.coverImage || '/no-cover.png'}
                    alt={book.documentName}
                />
                
                {/* Nội dung sách */}
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 200, justifyContent: 'space-between' }}>
                    {/* Tag loại sách */}
                    <Chip
                        label={book.documentCategory === 'PHYSICAL' ? 'Sách giấy' : book.documentCategory === 'DIGITAL' ? 'Sách điện tử' : 'Sách giấy & điện tử'}
                        color={book.documentCategory === 'PHYSICAL' ? 'primary' : book.documentCategory === 'DIGITAL' ? 'success' : 'secondary'}
                        size="small"
                        sx={{ mb: 1, fontWeight: 600, borderRadius: 2 }}
                    />
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography 
                            variant="h6" 
                            fontWeight="bold"
                            sx={{ cursor: onTitleClick ? 'pointer' : 'inherit', '&:hover': onTitleClick ? { color: 'primary.main', textDecoration: 'underline' } : {} }}
                            onClick={onTitleClick ? () => onTitleClick(book.documentId.toString()) : undefined}
                        >
                            {book.documentName}
                        </Typography>
                        <IconButton onClick={handleToggleFavorite} aria-label="favorite">
                            {isFavorite ? (
                                <FavoriteIcon sx={{ color: 'red' }} />
                            ) : (
                                <FavoriteBorderIcon />
                            )}
                        </IconButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        bởi {book.author}
                    </Typography>
                    {/* Chỉ hiển thị các dòng dưới nếu KHÔNG phải sách điện tử */}
                    {book.documentCategory !== 'DIGITAL' && (
                        <>
                            <Typography variant="body2">Nhà xuất bản: {book.publisher}</Typography>
                            <Typography variant="body2">Ngày xuất bản: {book.publishedDate || 'N/A'}</Typography>
                            <Typography variant="body2">Ngôn ngữ: {book.language || 'N/A'}</Typography>
                            <Typography variant="body2">Có sẵn: {book.quantity} bản</Typography>
                        </>
                    )}
                    {/* Nếu là sách điện tử, hiển thị trạng thái public/private */}
                    {book.documentCategory === 'DIGITAL' && (
                        <Typography variant="body2">
                            Trạng thái: {(book.digitalDocument as any)?.visibilityStatus === 'PUBLIC' ? 'Public' : 'Private'}
                        </Typography>
                    )}
                    
                    {/* Mô tả sách */}
                    <Box mt={1}>
                        <Typography variant="body2">{book.description}</Typography>
                    </Box>

                    {/* Action buttons */}
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {/* Borrow button - shown for all book types */}
                        <Button
                            variant="outlined"
                            color="success"
                            startIcon={<LocalLibraryIcon />}
                            onClick={handleBorrowClick}
                            sx={{ 
                                borderRadius: '10px',
                                textTransform: 'none',
                                borderWidth: 1,
                                '&:hover': {
                                    borderWidth: 1,
                                    backgroundColor: 'rgba(76, 175, 80, 0.04)'
                                }
                            }}
                        >
                            Mượn sách
                        </Button>

                        {/* File action buttons - only for DIGITAL documents */}
                        {book.digitalDocument?.uploads && (
                            <>
                                {book.digitalDocument.uploads.some(upload => 
                                    upload.fileType === 'application/pdf' || upload.fileType === 'pdf'
                                ) && (
                                    <Chip
                                        icon={<PictureAsPdfIcon />}
                                        label="PDF"
                                        color="error"
                                        variant="outlined"
                                        onClick={() => handleFileOpen(pdfUrl)}
                                        sx={{ 
                                            borderRadius: '10px',
                                            '& .MuiChip-icon': {
                                                color: 'error.main'
                                            }
                                        }}
                                    />
                                )}
                                {book.digitalDocument.uploads.some(upload => 
                                    upload.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                                    upload.fileType === 'application/msword' ||
                                    upload.fileType === 'docx' ||
                                    upload.fileType === 'doc'
                                ) && (
                                    <Chip
                                        icon={<DescriptionIcon />}
                                        label="Word"
                                        color="primary"
                                        variant="outlined"
                                        onClick={() => handleFileOpen(wordUrl)}
                                        sx={{ 
                                            borderRadius: '10px',
                                            '& .MuiChip-icon': {
                                                color: 'primary.main'
                                            }
                                        }}
                                    />
                                )}
                            </>
                        )}
                    </Box>
                </CardContent>
            </Card>

            {/* Borrow Confirmation Dialog */}
            <Dialog
                open={borrowDialogOpen}
                onClose={handleBorrowCancel}
                aria-labelledby="borrow-dialog-title"
                aria-describedby="borrow-dialog-description"
                PaperProps={{
                    sx: {
                        borderRadius: '15px',
                        minWidth: '400px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }
                }}
            >
                <DialogTitle 
                    id="borrow-dialog-title"
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        py: 2,
                        px: 3,
                        '& .MuiTypography-root': {
                            fontWeight: 600
                        },
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Typography variant="h6" component="div">
                        Xác nhận mượn sách
                    </Typography>
                    <IconButton
                        onClick={handleBorrowCancel}
                        sx={{
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <DialogContentText 
                        id="borrow-dialog-description"
                        sx={{ 
                            mt: 2,
                            mb: 3,
                            fontSize: '1.1rem',
                            color: 'text.primary'
                        }}
                    >
                        Bạn có chắc chắn muốn mượn "{book.documentName}" của {book.author}?
                    </DialogContentText>

                    {book.documentCategory === 'BOTH' && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                                Chọn loại sách muốn mượn:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    variant={borrowType === 'physical' ? 'contained' : 'outlined'}
                                    color="primary"
                                    onClick={() => setBorrowType('physical')}
                                    startIcon={<LocalLibraryIcon />}
                                    sx={{ 
                                        flex: 1,
                                        py: 1.5,
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        fontWeight: 500
                                    }}
                                >
                                    Sách vật lý
                                </Button>
                                <Button
                                    variant={borrowType === 'digital' ? 'contained' : 'outlined'}
                                    color="primary"
                                    onClick={() => setBorrowType('digital')}
                                    startIcon={<DescriptionIcon />}
                                    sx={{ 
                                        flex: 1,
                                        py: 1.5,
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        fontWeight: 500
                                    }}
                                >
                                    Sách điện tử
                                </Button>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button 
                        onClick={handleBorrowCancel}
                        sx={{ 
                            borderRadius: '10px',
                            textTransform: 'none',
                            px: 3,
                            fontWeight: 500
                        }}
                    >
                        Hủy
                    </Button>
                    <Button 
                        onClick={handleBorrowConfirm}
                        variant="contained"
                        color="primary"
                        disabled={book.documentCategory === 'BOTH' && !borrowType}
                        sx={{ 
                            borderRadius: '10px',
                            textTransform: 'none',
                            px: 3,
                            fontWeight: 500
                        }}
                    >
                        Xác nhận mượn
                    </Button>
                </DialogActions>
            </Dialog>
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
        </>
    );
};

export default BookInfo;