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
    Button
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
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

interface Book {
    documentId: number;
    documentName: string;
    author: string;
    publisher: string;
    publishedDate: string | null;
    pageCount: number;
    language: string | null;
    availableCount: number;
    description: string;
    coverImage: string;
    documentCategory: string;
    digitalDocuments: DigitalDocument[];
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

    useEffect(() => {
        if (!books) return;
        const foundBook = books.find((b) => b.documentId.toString() === id);
        if (foundBook) {
            setBook(foundBook);
            
            // Check for file types if it's a digital document
            if (foundBook.documentCategory === 'DIGITAL' && foundBook.digitalDocuments?.length > 0) {
                const digitalDoc = foundBook.digitalDocuments[0];
                digitalDoc.uploads.forEach((upload) => {
                    if (upload.fileType === 'pdf') {
                        setHasPdf(true);
                        setPdfUrl(upload.filePath);
                    } else if (upload.fileType === 'word' || upload.fileName.endsWith('.docx')) {
                        setHasWord(true);
                        setWordUrl(upload.filePath);
                    } else if (upload.fileType === 'mp4') {
                        setHasMp4(true);
                        setMp4Url(upload.filePath);
                    }
                });
            }
        }
    }, [id, books]);

    const handleToggleFavorite = async () => {
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
                console.error('Lỗi khi cập nhật trạng thái yêu thích.');
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
        <Card sx={{ display: 'flex', boxShadow: 3, p: 2, width: '100%', borderRadius: '20px' }}>
            {/* Ảnh bìa */}
            <CardMedia
                component="img"
                sx={{ 
                    width: 150, 
                    height: 200, 
                    objectFit: 'cover', 
                    bgcolor: '#f5f5f5',
                    border: '1px solid black',
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
                    by {book.author}
                </Typography>
                <Typography variant="body2">Publisher: {book.publisher}</Typography>
                <Typography variant="body2">Published: {book.publishedDate || 'N/A'}</Typography>
                <Typography variant="body2">Pages: {book.pageCount}</Typography>
                <Typography variant="body2">Language: {book.language || 'N/A'}</Typography>
                <Typography variant="body2">Available: {book.availableCount} copies</Typography>
                
                {/* Mô tả sách */}
                <Box mt={1}>
                    <Typography variant="body2">{book.description}</Typography>
                </Box>

                {/* File action buttons - only for DIGITAL documents */}
                {book.documentCategory === 'DIGITAL' && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        {hasPdf && (
                            <Button
                                variant="contained"
                                startIcon={<PictureAsPdfIcon />}
                                onClick={() => handleFileOpen(pdfUrl)}
                                sx={{ textTransform: 'none' }}
                            >
                                Read PDF
                            </Button>
                        )}
                        {hasWord && (
                            <Button
                                variant="contained"
                                startIcon={<DescriptionIcon />}
                                onClick={() => handleFileOpen(wordUrl)}
                                sx={{ textTransform: 'none' }}
                            >
                                Read Word
                            </Button>
                        )}
                        {hasMp4 && (
                            <Button
                                variant="contained"
                                startIcon={<PlayCircleIcon />}
                                onClick={() => handleFileOpen(mp4Url)}
                                sx={{ textTransform: 'none' }}
                            >
                                Play Video
                            </Button>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default BookInfo;