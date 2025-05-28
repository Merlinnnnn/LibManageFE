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
    DialogActions
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import apiService from '../../untils/api';

interface BookInfoProps {
    id: string;
    books: Book[] | undefined;
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

const BookInfo: React.FC<BookInfoProps> = ({ id, books }) => {
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

    useEffect(() => {
        if (!books) return;
        console.log('books', books);
        checkFavor(id);
        const foundBook = books.find((b) => b.documentId.toString() === id);
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

    const handleToggleFavorite = async () => {
        try {
            console.log(id);          let response;
            if (!isFavorite) {
                response = await apiService.post(`/api/v1/documents/${id}/favorite`);
                console.log(response);
            } else {
                response = await apiService.delete(`/api/v1/documents/${id}/favorite`);
                console.log(response);
            }

            if (response.status === 200) {
                setIsFavorite(!isFavorite);
            } else {
                console.error('Lỗi khi cập nhật trạng thái yêu thích.');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái yêu thích:', error);
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
        // Convert backslash to forward slash for URLs
        const formattedUrl = fileUrl.replace(/\\/g, '/');
        window.open(`/${formattedUrl}`, '_blank');
    };

    const handleBorrowClick = () => {
        setBorrowDialogOpen(true);
    };

    const handleBorrowConfirm = async () => {
        try {
            console.log(`Mượn sách thành công với id sách: ${id}`);
            
            if (book?.documentCategory === 'DIGITAL' && book.digitalDocument?.uploads?.[0]) {
                // For digital books, use the access-requests API with uploadId
                const payload = {
                    uploadId: book.digitalDocument.uploads[0].uploadId
                };
                const res = await apiService.post('/api/v1/access-requests', payload);
                console.log('Response:', res.data);
            } else {
                // For physical books, use the loans API
                const payload = {
                    physicalDocId: id,
                };
                const res = await apiService.post('/api/v1/loans', payload);
                console.log('Response:', res.data);
            }
            setBorrowDialogOpen(false);
        } catch (error) {
            console.error('Lỗi khi mượn sách:', error);
            // Có thể hiện thông báo lỗi cho người dùng
        }
    };
    

    const handleBorrowCancel = () => {
        setBorrowDialogOpen(false);
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
            <Card sx={{ display: 'flex', boxShadow: 3, p: 2, width: '100%', borderRadius: '20px', overflow: 'hidden', position: 'relative'}}>
                {/* Ảnh bìa */}
                <CardMedia
                    component="img"
                    sx={{ 
                        width: 150, 
                        height: 200, 
                        objectFit: 'cover', 
                        bgcolor: '#f5f5f5',
                        //border: '1px solid black',
                        borderRadius: '20px'
                    }}
                    image={book.coverImage || '/no-cover.png'}
                    alt={book.documentName}
                />
                
                {/* Nội dung sách */}
                <CardContent sx={{ flex: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight="bold">
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
                    <Typography variant="body2">Nhà xuất bản: {book.publisher}</Typography>
                    <Typography variant="body2">Ngày xuất bản: {book.publishedDate || 'N/A'}</Typography>
                    <Typography variant="body2">Ngôn ngữ: {book.language || 'N/A'}</Typography>
                    <Typography variant="body2">Có sẵn: {book.quantity} bản</Typography>
                    
                    {/* Mô tả sách */}
                    <Box mt={1}>
                        <Typography variant="body2">{book.description}</Typography>
                    </Box>

                    {/* Action buttons */}
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {/* Borrow button - shown for all book types */}
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<LocalLibraryIcon />}
                            onClick={handleBorrowClick}
                            sx={{ textTransform: 'none' }}
                            //disabled={book.quantity <= 0}
                        >
                            Mượn sách
                        </Button>

                        {/* File action buttons - only for DIGITAL documents */}
                        {book.documentCategory === 'DIGITAL' && book.digitalDocument?.uploads && (
                            <>
                                {hasPdf && (
                                    <Button
                                        variant="contained"
                                        startIcon={<PictureAsPdfIcon />}
                                        onClick={() => handleFileOpen(pdfUrl)}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Đọc PDF
                                    </Button>
                                )}
                                {hasWord && (
                                    <Button
                                        variant="contained"
                                        startIcon={<DescriptionIcon />}
                                        onClick={() => handleFileOpen(wordUrl)}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Đọc Word
                                    </Button>
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
            >
                <DialogTitle id="borrow-dialog-title">Xác nhận mượn sách</DialogTitle>
                <DialogContent>
                    <DialogContentText id="borrow-dialog-description">
                        Bạn có chắc chắn muốn mượn "{book.documentName}" của {book.author}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleBorrowCancel} color="primary">
                        Hủy
                    </Button>
                    <Button onClick={handleBorrowConfirm} color="primary" autoFocus>
                        Xác nhận mượn
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default BookInfo;