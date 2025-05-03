import React, { useState, useEffect } from 'react';
import {
    Grid,
    Box,
    Pagination,
    CircularProgress,
    Typography,
    Paper,
    TextField,
    InputAdornment,
    useTheme,
    Chip,
    Button,
    CardContent,
    Card,
    CardMedia,
    Divider,
    Switch,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tabs,
    Tab
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddIcon from '@mui/icons-material/Add';
import Header from '../Home/Header';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import apiService from '@/app/untils/api';
import CategoryIcon from '@mui/icons-material/Category';
import SchoolIcon from '@mui/icons-material/School';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddBookDialog from './AddDigital';
import FavoriteIcon from '@mui/icons-material/Favorite';

interface Book {
    id: string;
    title: string;
    author: string;
    coverImage: string;
    uploadDate: string;
    fileSize: string;
    documentType: string;
    courses: string[];
    isPublic: boolean;
    wordFile?: string;
    pdfFile?: string;
    mp4File?: string;
}

interface FavoriteBook {
    documentId: string;
    documentName: string;
    author: string;
    coverImage: string;
    uploadDate: string;
    fileSize: string;
    documentType: string;
    courses: string[];
    wordFile?: string;
    pdfFile?: string;
    mp4File?: string;
}

interface DocumentType {
    id: number;
    name: string;
}

interface Course {
    id: number;
    name: string;
}
type CourseItem = { courseId: number; courseName: string };
type CourseApiResponse = ApiResponse<CourseItem>;

type DocumentTypeItem = { documentTypeId: number; typeName: string };
type DocumentTypeApiResponse = ApiResponse<DocumentTypeItem>; 

interface ApiResponse<T> {
    code: number;
    data: {
        content: T[];
        last: boolean;
        pageNumber: number;
        pageSize: number;
        sortDetails: any[];
        totalElements: number;
        totalPages: number;
    };
    message: string;
    success: boolean;
}

interface DigitalDocument {
    digitalDocumentId: string;
    documentName: string;
    author: string;
    coverImage: string;
    description: string;
    publisher: string;
    uploads: Array<{
        uploadId: string;
        fileType: string;
        fileUrl: string;
        fileSize: string;
        uploadDate: string;
    }>;
}

const MyBookShelf: React.FC = () => {
    const theme = useTheme();
    const [books, setBooks] = useState<Book[]>([]);
    const [favoriteBooks, setFavoriteBooks] = useState<FavoriteBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [favoritesLoading, setFavoritesLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [openUploadDialog, setOpenUploadDialog] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [favoritesPage, setFavoritesPage] = useState(0);
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<number[]>([]);
    const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [bookToToggle, setBookToToggle] = useState<Book | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const booksPerPage = 5;

    const fetchBooks = async (): Promise<Book[]> => {
        try {
            const infoString = localStorage.getItem('info');
            let userId = '';

            if (infoString) {
                const info = JSON.parse(infoString) as { userId: string };
                userId = info.userId;
            }

            const response = await apiService.get<ApiResponse<DigitalDocument>>(`/api/v1/digital-documents/users/${userId}`);
            console.log('fetchbook', response);
            
            return response.data.data.content.map(doc => {
                const wordFile = doc.uploads.find(u => u.fileType === 'DOCX')?.fileUrl;
                const pdfFile = doc.uploads.find(u => u.fileType === 'PDF')?.fileUrl;
                const mp4File = doc.uploads.find(u => u.fileType === 'MP4')?.fileUrl;
                const firstUpload = doc.uploads[0];

                return {
                    id: doc.digitalDocumentId,
                    title: doc.documentName,
                    author: doc.author,
                    coverImage: doc.coverImage,
                    uploadDate: firstUpload?.uploadDate || '',
                    fileSize: firstUpload?.fileSize || '',
                    documentType: 'Textbook',
                    courses: [doc.documentName],
                    isPublic: true,
                    wordFile,
                    pdfFile,
                    mp4File
                };
            });
        } catch (error) {
            console.error('Error fetching books:', error);
            return [];
        }
    };

    const fetchFavoriteBooks = async (): Promise<FavoriteBook[]> => {
        try {
            const response = await apiService.get<ApiResponse<FavoriteBook>>('/api/v1/favorites', {
                params: {
                    size: booksPerPage,
                    page: favoritesPage,
                },
            });
            console.log(response);
            if (response.data.success) {
                return response.data.data.content.map(book => ({
                    documentId: book.documentId,
                    documentName: book.documentName,
                    author: book.author,
                    coverImage: book.coverImage,
                    uploadDate: book.uploadDate,
                    fileSize: book.fileSize,
                    documentType: book.documentType,
                    courses: book.courses,
                    wordFile: book.wordFile,
                    pdfFile: book.pdfFile,
                    mp4File: book.mp4File
                }));
            }
            return [];
        } catch (error) {
            console.error('Error fetching favorite books:', error);
            return [];
        }
    };

    const fetchDocumentTypes = async (): Promise<DocumentType[]> => {
        try {
            const res = await apiService.get<DocumentTypeApiResponse>('/api/v1/document-types');
            if (res.data.success) {
                return res.data.data.content.map(item => ({
                    id: item.documentTypeId,
                    name: item.typeName
                }));
            }
            return [];
        } catch (error) {
            console.error('Error fetching document types:', error);
            return [];
        }
    };

    const fetchCourses = async (): Promise<Course[]> => {
        try {
            const res = await apiService.get<CourseApiResponse>('/api/v1/courses');
            if (res.data.success) {
                return res.data.data.content.map(item => ({
                    id: item.courseId,
                    name: item.courseName
                }));
            }
            return [];
        } catch (error) {
            console.error('Error fetching courses:', error);
            return [];
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const [booksData, typesData, coursesData] = await Promise.all([
                    fetchBooks(),
                    fetchDocumentTypes(),
                    fetchCourses()
                ]);

                setBooks(booksData);
                console.log(booksData);
                setDocumentTypes(typesData);
                setCourses(coursesData);
                setLoading(false);
            } catch (error) {
                console.error('Error loading data:', error);
                setLoading(false);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        const loadFavorites = async () => {
            setFavoritesLoading(true);
            try {
                const favoritesData = await fetchFavoriteBooks();
                setFavoriteBooks(favoritesData);
                console.log(favoritesData);
            } catch (error) {
                console.error('Error loading favorites:', error);
            } finally {
                setFavoritesLoading(false);
            }
        };

        if (activeTab === 1) {
            loadFavorites();
        }
    }, [activeTab, favoritesPage]);

    const handleTogglePublic = (book: Book) => {
        setBookToToggle(book);
        setOpenConfirmDialog(true);
    };

    const confirmTogglePublic = () => {
        if (bookToToggle) {
            setBooks(books.map(book =>
                book.id === bookToToggle.id
                    ? { ...book, isPublic: !book.isPublic }
                    : book
            ));
        }
        setOpenConfirmDialog(false);
    };

    const handleFileOpen = (fileUrl: string) => {
        window.open(fileUrl, '_blank');
    };

    const handleCourseToggle = (courseId: number) => {
        setSelectedCourses(prev =>
            prev.includes(courseId)
                ? prev.filter(id => id !== courseId)
                : [...prev, courseId]
        );
    };

    const handleUploadSuccess = async () => {
        const updatedBooks = await fetchBooks();
        setBooks(updatedBooks);
        setOpenUploadDialog(false);
    };

    const handleDocumentTypeToggle = (typeId: number) => {
        setSelectedDocumentTypes(prev =>
            prev.includes(typeId)
                ? prev.filter(id => id !== typeId)
                : [...prev, typeId]
        );
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const currentBooks = books.slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage);
    const currentFavorites = favoriteBooks.slice(favoritesPage * booksPerPage, (favoritesPage + 1) * booksPerPage);

    return (
        <Box>
            <Header />
            <Box sx={{ padding: '20px', display: 'flex', gap: '20px' }}>
                <Paper sx={{ padding: '20px', width: '300px', flexShrink: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <FilterListIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Filters</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CategoryIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="subtitle1">Document Types</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                        {documentTypes.map((type) => (
                            <Chip
                                key={type.id}
                                label={type.name}
                                color={selectedDocumentTypes.includes(type.id) ? 'primary' : 'default'}
                                onClick={() => handleDocumentTypeToggle(type.id)}
                                variant={selectedDocumentTypes.includes(type.id) ? 'filled' : 'outlined'}
                            />
                        ))}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <SchoolIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="subtitle1">Courses</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {courses.map((course) => (
                            <Chip
                                key={course.id}
                                label={course.name}
                                color={selectedCourses.includes(course.id) ? 'primary' : 'default'}
                                onClick={() => handleCourseToggle(course.id)}
                                variant={selectedCourses.includes(course.id) ? 'filled' : 'outlined'}
                                sx={{ mb: 1 }}
                            />
                        ))}
                    </Box>
                </Paper>

                <Paper sx={{ padding: '20px', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <TextField
                            variant="outlined"
                            placeholder={activeTab === 0 ? "Search your books..." : "Search your favorites..."}
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{
                                width: '300px',
                                backgroundColor: theme.palette.background.default,
                                borderRadius: '20px',
                                '& fieldset': {
                                    borderRadius: '20px',
                                },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        {activeTab === 0 && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setOpenUploadDialog(true)}
                            >
                                Upload New Book
                            </Button>
                        )}
                    </Box>

                    <Tabs value={activeTab} onChange={handleTabChange} aria-label="book shelf tabs">
                        <Tab label="My Books" icon={<DescriptionIcon />} iconPosition="start" />
                        <Tab label="Favorites" icon={<FavoriteIcon />} iconPosition="start" />
                    </Tabs>

                    {activeTab === 0 ? (
                        <>
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : currentBooks.length > 0 ? (
                                <>
                                    <Grid container spacing={3}>
                                        {currentBooks.map((book: Book) => (
                                            <Grid item xs={12} key={book.id}>
                                                <Card sx={{ display: 'flex', boxShadow: 3, p: 2, width: '100%', borderRadius: '20px' }}>
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
                                                        image={book.coverImage || 'https://th.bing.com/th/id/OIP.cB5B7jK44BU3VNazD-SqYgHaHa?rs=1&pid=ImgDetMain'}
                                                        alt={book.title}
                                                    />

                                                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Box>
                                                                <Typography variant="h6" fontWeight="bold">
                                                                    {book.title}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    by {book.author}
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <Typography variant="body2" sx={{ mr: 1 }}>
                                                                    {book.isPublic ? 'Public' : 'Private'}
                                                                </Typography>
                                                                <Switch
                                                                    checked={book.isPublic}
                                                                    onChange={() => handleTogglePublic(book)}
                                                                    color={book.isPublic ? 'success' : 'error'}
                                                                />
                                                            </Box>
                                                        </Box>

                                                        <Typography variant="body2">Uploaded: {book.uploadDate}</Typography>
                                                        <Typography variant="body2">Size: {book.fileSize}</Typography>

                                                        <Box mt={1}>
                                                            <Typography variant="body2">Courses: {book.courses.join(', ')}</Typography>
                                                        </Box>

                                                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                                            {book.wordFile && (
                                                                <Button
                                                                    variant="contained"
                                                                    startIcon={<DescriptionIcon />}
                                                                    onClick={() => handleFileOpen(book.wordFile!)}
                                                                    sx={{ textTransform: 'none' }}
                                                                >
                                                                    Read Word
                                                                </Button>
                                                            )}
                                                            {book.pdfFile && (
                                                                <Button
                                                                    variant="contained"
                                                                    startIcon={<PictureAsPdfIcon />}
                                                                    onClick={() => handleFileOpen(book.pdfFile!)}
                                                                    sx={{ textTransform: 'none' }}
                                                                >
                                                                    Read PDF
                                                                </Button>
                                                            )}
                                                            {book.mp4File && (
                                                                <Button
                                                                    variant="contained"
                                                                    startIcon={<PlayCircleIcon />}
                                                                    onClick={() => handleFileOpen(book.mp4File!)}
                                                                    sx={{ textTransform: 'none' }}
                                                                >
                                                                    Play Video
                                                                </Button>
                                                            )}
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                        <Pagination
                                            count={Math.ceil(books.length / booksPerPage)}
                                            page={currentPage}
                                            onChange={(event, page) => setCurrentPage(page)}
                                            color="primary"
                                        />
                                    </Box>
                                </>
                            ) : (
                                <Typography variant="h6" align="center" sx={{ py: 4 }}>
                                    No books found.
                                </Typography>
                            )}
                        </>
                    ) : (
                        <>
                            {favoritesLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : currentFavorites.length > 0 ? (
                                <>
                                    <Grid container spacing={3}>
                                        {currentFavorites.map((book: FavoriteBook) => (
                                            <Grid item xs={12} key={book.documentId}>
                                                <Card sx={{ display: 'flex', boxShadow: 3, p: 2, width: '100%', borderRadius: '20px' }}>
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
                                                        image={book.coverImage || 'https://th.bing.com/th/id/OIP.cB5B7jK44BU3VNazD-SqYgHaHa?rs=1&pid=ImgDetMain'}
                                                        alt={book.documentName}
                                                    />

                                                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                        <Box>
                                                            <Typography variant="h6" fontWeight="bold">
                                                                {book.documentName}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                by {book.author}
                                                            </Typography>
                                                        </Box>

                                                        <Typography variant="body2">Uploaded: {book.uploadDate}</Typography>
                                                        <Typography variant="body2">Size: {book.fileSize}</Typography>

                                                        {/* <Box mt={1}>
                                                            <Typography variant="body2">Courses: {book.courses.join(', ') || 'N/A'}</Typography>
                                                        </Box> */}

                                                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                                            {book.wordFile && (
                                                                <Button
                                                                    variant="contained"
                                                                    startIcon={<DescriptionIcon />}
                                                                    onClick={() => handleFileOpen(book.wordFile!)}
                                                                    sx={{ textTransform: 'none' }}
                                                                >
                                                                    Read Word
                                                                </Button>
                                                            )}
                                                            {book.pdfFile && (
                                                                <Button
                                                                    variant="contained"
                                                                    startIcon={<PictureAsPdfIcon />}
                                                                    onClick={() => handleFileOpen(book.pdfFile!)}
                                                                    sx={{ textTransform: 'none' }}
                                                                >
                                                                    Read PDF
                                                                </Button>
                                                            )}
                                                            {book.mp4File && (
                                                                <Button
                                                                    variant="contained"
                                                                    startIcon={<PlayCircleIcon />}
                                                                    onClick={() => handleFileOpen(book.mp4File!)}
                                                                    sx={{ textTransform: 'none' }}
                                                                >
                                                                    Play Video
                                                                </Button>
                                                            )}
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                        <Pagination
                                            count={Math.ceil(favoriteBooks.length / booksPerPage)}
                                            page={favoritesPage}
                                            onChange={(event, page) => setFavoritesPage(page)}
                                            color="primary"
                                        />
                                    </Box>
                                </>
                            ) : (
                                <Typography variant="h6" align="center" sx={{ py: 4 }}>
                                    No favorite books found.
                                </Typography>
                            )}
                        </>
                    )}
                </Paper>
            </Box>

            <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
                <DialogTitle>Confirm Change</DialogTitle>
                <DialogContent>
                    {bookToToggle && (
                        <Typography>
                            Are you sure you want to make "{bookToToggle.title}" {bookToToggle.isPublic ? 'private' : 'public'}?
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirmDialog(false)}>Cancel</Button>
                    <Button onClick={confirmTogglePublic} color="primary" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
            <AddBookDialog
                open={openUploadDialog}
                onClose={() => setOpenUploadDialog(false)}
                onUploadSuccess={handleUploadSuccess}
                documentTypes={documentTypes}
                courses={courses}
            />
        </Box>
    );
};

export default MyBookShelf;