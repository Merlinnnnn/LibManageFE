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
    Tab,
    Container,
    IconButton,
    Fab,
    Zoom
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
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import ListIcon from '@mui/icons-material/List';
import AccessList from './AccessList';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

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
    approvalStatus: string;
    visibilityStatus: string;
}

interface Book {
    id: number;
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
    approvalStatus: string;
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

const getStatusColor = (status: string) => {
    switch (status) {
        case 'APPROVED':
            return 'success';
        case 'APPROVED_BY_AI':
        case 'PENDING':
            return 'warning';
        case 'REJECTED':
        case 'REJECTED_BY_AI':
            return 'error';
        default:
            return 'default';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'APPROVED':
            return 'Đã duyệt';
        case 'APPROVED_BY_AI':
        case 'PENDING':
            return 'Đang chờ';
        case 'REJECTED':
            return 'Từ chối';
        case 'REJECTED_BY_AI':
            return 'Từ chối';
        default:
            return status;
    }
};

const MyBookShelf: React.FC = () => {
    const theme = useTheme();
    const [books, setBooks] = useState<Book[]>([]);
    const [favoriteBooks, setFavoriteBooks] = useState<FavoriteBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [favoritesLoading, setFavoritesLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchString, setSearchString] = useState('');
    const [showScrollTop, setShowScrollTop] = useState(false);
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
    const booksPerPage = 10;
    const [accessListOpen, setAccessListOpen] = useState(false);
    const [selectedDigitalId, setSelectedDigitalId] = useState<number | null>(null);
    const [allBooks, setAllBooks] = useState<Book[]>([]);
    const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
    const [openTypeFilter, setOpenTypeFilter] = useState(true);
    const [openCourseFilter, setOpenCourseFilter] = useState(true);

    // Add scroll event listener
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.pageYOffset > 400);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const fetchBooks = async (): Promise<Book[]> => {
        try {
            const infoString = localStorage.getItem('info');
            let userId = '';

            if (infoString) {
                const info = JSON.parse(infoString) as { userId: string };
                userId = info.userId;
            }

            const params: Record<string, any> = {};
            
            if (searchQuery.trim()) {
                params.title = searchQuery.trim();
            }

            if (selectedDocumentTypes.length > 0) {
                params.documentTypeIds = selectedDocumentTypes.join(',');
            }

            if (selectedCourses.length > 0) {
                params.courseIds = selectedCourses.join(',');
            }

            const response = await apiService.get<ApiResponse<DigitalDocument>>(
                `/api/v1/digital-documents/users/${userId}`,
                { params }
            );
            
            const fetchedBooks = response.data.data.content.map(doc => {
                const wordFile = doc.uploads.find(u => 
                    u.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                    u.fileType === 'application/msword' || 
                    u.fileType === 'docx' ||
                    u.fileType === 'doc'
                )?.filePath;
                const pdfFile = doc.uploads.find(u => 
                    u.fileType === 'application/pdf' || 
                    u.fileType === 'pdf'
                )?.filePath;
                const firstUpload = doc.uploads[0];

                return {
                    id: doc.digitalDocumentId,
                    title: doc.documentName,
                    author: doc.author,
                    coverImage: doc.coverImage || 'https://th.bing.com/th/id/OIP.cB5B7jK44BU3VNazD-SqYgHaHa?rs=1&pid=ImgDetMain',
                    uploadDate: firstUpload?.uploadedAt || '',
                    fileSize: '0 MB',
                    documentType: 'Textbook',
                    courses: [doc.documentName],
                    isPublic: doc.visibilityStatus === 'PUBLIC',
                    wordFile,
                    pdfFile,
                    approvalStatus: doc.approvalStatus
                };
            });

            setAllBooks(fetchedBooks);
            setFilteredBooks(fetchedBooks);
            return fetchedBooks;
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
            console.log('Danh sach sach:',response);
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
                    pdfFile: book.pdfFile
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

    const confirmTogglePublic = async () => {
        if (bookToToggle) {
            try {
                const response = await apiService.post(
                    `/api/v1/digital-documents/${bookToToggle.id}/visibility?status=${bookToToggle.isPublic ? "RESTRICTED_VIEW" : "PUBLIC"}`,
                );
                console.log('Responsedsxadsadsadsa:', response);
                // Refetch books to update UI
                const updatedBooks = await fetchBooks();
                setBooks(updatedBooks);
            } catch (error) {
                console.error('Error toggling visibility:', error);
            }
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

    const handleAccessListClick = (digitalId: number) => {
        setSelectedDigitalId(digitalId);
        setAccessListOpen(true);
    };

    const handleAccessListClose = () => {
        setAccessListOpen(false);
        setSelectedDigitalId(null);
    };

    const currentBooks = filteredBooks.slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage);
    const currentFavorites = favoriteBooks.slice(favoritesPage * booksPerPage, (favoritesPage + 1) * booksPerPage);

    const searchBooks = (title: string) => {
        setLoading(true);
        setSearchQuery(title);
        fetchBooks().finally(() => setLoading(false));
    };

    const filterBooks = () => {
        setLoading(true);
        fetchBooks().finally(() => setLoading(false));
    };

    // Update useEffect for filter
    useEffect(() => {
        if (selectedDocumentTypes.length > 0 || selectedCourses.length > 0) {
            filterBooks();
        } else {
            fetchBooks();
        }
    }, [selectedDocumentTypes, selectedCourses]);

    const handleSearchKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            if (searchQuery.trim()) {
                searchBooks(searchQuery);
            } else {
                fetchBooks();
            }
        }
    };

    const handleSearchButton = () => {
        if (searchQuery.trim()) {
            searchBooks(searchQuery);
        } else {
            fetchBooks();
        }
    };

    const handleToggleFavorite = async (bookId: string) => {
        try {
            // Remove from favorites
            await apiService.delete(`/api/v1/documents/${bookId}/favorite`);
            // Refresh favorites list
            const favoritesData = await fetchFavoriteBooks();
            setFavoriteBooks(favoritesData);
        } catch (error) {
            console.error('Error removing from favorites:', error);
        }
    };

    return (
        <Box>
            <Header />
            <Box sx={{ 
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                minHeight: '100vh',
                py: 4,
                position: 'relative'
            }}>
                <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
                    {/* Search Bar */}
                    <Box sx={{ 
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderRadius: 4,
                        p: 4,
                        mb: 4,
                        textAlign: 'center',
                        boxShadow: 3,
                        background: 'linear-gradient(45deg, #6a1b9a 30%, #9c27b0 90%)'
                    }}>
                        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                            Thư viện ảo của tôi
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            Quản lý và sắp xếp tài liệu điện tử của bạn
                        </Typography>
                        
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center',
                            maxWidth: 600,
                            mx: 'auto'
                        }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Tìm sách"
                                size="medium"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                onKeyDown={handleSearchKeyPress}
                                sx={{
                                    bgcolor: 'background.paper',
                                    borderRadius: 4,
                                    '& fieldset': {
                                        borderRadius: 2,
                                        border: 'none'
                                    },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <Button 
                                            variant="contained" 
                                            color="secondary"
                                            onClick={handleSearchButton}
                                            sx={{
                                                borderRadius: 2,
                                                px: 3,
                                                textTransform: 'none',
                                                boxShadow: 'none'
                                            }}
                                        >
                                            Tìm
                                        </Button>
                                    )
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Add Book Button */}
                    <Fab
                        color="primary"
                        aria-label="add"
                        onClick={() => setOpenUploadDialog(true)}
                        sx={{
                            position: 'fixed',
                            bottom: 24,
                            right: 24,
                            zIndex: 1000,
                            width: 56,
                            height: 56,
                            '&:hover': {
                                backgroundColor: 'secondary.main'
                            }
                        }}
                    >
                        <AddIcon />
                    </Fab>
                    
                    {/* Main Content */}
                    <Grid container spacing={4}>
                        {/* Filters Sidebar */}
                        <Grid item xs={12} md={3}>
                            <Paper sx={{ 
                                p: { xs: 1.5, sm: 2, md: 3 },
                                borderRadius: 3,
                                position: { md: 'sticky' },
                                top: { xs: 0, sm: 20, md: 28 },
                                boxShadow: 3,
                                maxHeight: { md: 'calc(100vh - 100px)' },
                                overflowY: { md: 'auto' },
                                minWidth: { xs: 0, sm: 0, md: 220, lg: 320 },
                                width: '100%',
                                mb: { xs: 3, md: 0 },
                                boxSizing: 'border-box',
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <FilterListIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">Filters</Typography>
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Box
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            mb: 1, 
                                            cursor: 'pointer',
                                            userSelect: 'none'
                                        }}
                                        onClick={() => setOpenTypeFilter((prev) => !prev)}
                                    >
                                        <CategoryIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                                        <Typography variant="subtitle1" sx={{ flex: 1 }}>Document Types</Typography>
                                        {openTypeFilter ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </Box>
                                    {openTypeFilter && (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {documentTypes.map((type) => (
                                                <Chip
                                                    key={type.id}
                                                    label={type.name}
                                                    clickable
                                                    variant={selectedDocumentTypes.includes(type.id) ? 'filled' : 'outlined'}
                                                    color={selectedDocumentTypes.includes(type.id) ? 'primary' : 'default'}
                                                    onClick={() => handleDocumentTypeToggle(type.id)}
                                                    sx={{ mb: 1, borderRadius: '10px' }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box>
                                    <Box
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            mb: 1,
                                            cursor: 'pointer',
                                            userSelect: 'none'
                                        }}
                                        onClick={() => setOpenCourseFilter((prev) => !prev)}
                                    >
                                        <SchoolIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                                        <Typography variant="subtitle1" sx={{ flex: 1 }}>Courses</Typography>
                                        {openCourseFilter ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </Box>
                                    {openCourseFilter && (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {courses.map((course) => (
                                                <Chip
                                                    key={course.id}
                                                    label={course.name}
                                                    clickable
                                                    variant={selectedCourses.includes(course.id) ? 'filled' : 'outlined'}
                                                    color={selectedCourses.includes(course.id) ? 'primary' : 'default'}
                                                    onClick={() => handleCourseToggle(course.id)}
                                                    sx={{ mb: 1, borderRadius: '10px' }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Books List */}
                        <Grid item xs={12} md={9}>
                            <Paper sx={{ 
                                p: { xs: 1, sm: 1.5, md: 2 },
                                borderRadius: 3,
                                minHeight: '60vh',
                                boxShadow: 3,
                                width: '100%',
                                maxWidth: '100%',
                                mt: { xs: 2, md: 0 },
                            }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h5" sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        fontWeight: 600,
                                        color: 'primary.main'
                                    }}>
                                        <LocalLibraryIcon color="primary" sx={{ mr: 1 }} />
                                        {activeTab === 0 ? 'Sách của tôi' : 'Sách ưa thích'}
                                    </Typography>
                                    <Typography color="text.secondary" sx={{ 
                                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: '15px',
                                        fontSize: '0.9rem'
                                    }}>
                                        {activeTab === 0 ? books.length : favoriteBooks.length} {activeTab === 0 ? 'sách' : 'sách yêu thích'} được tìm thấy
                                    </Typography>
                                </Box>

                                <Tabs 
                                    value={activeTab} 
                                    onChange={(event, newValue) => setActiveTab(newValue)} 
                                    aria-label="book shelf tabs" 
                                    sx={{ 
                                        mb: 3,
                                        '& .MuiTabs-indicator': {
                                            height: 3,
                                            borderRadius: '3px',
                                            backgroundColor: 'primary.main',
                                        },
                                        '& .MuiTab-root': {
                                            borderRadius: '15px',
                                            mx: 1,
                                            minHeight: 48,
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            fontSize: '1rem',
                                            transition: 'all 0.3s ease',
                                            '&.Mui-selected': {
                                                color: 'primary.main',
                                                bgcolor: 'rgba(25, 118, 210, 0.08)',
                                            },
                                            '&:hover': {
                                                bgcolor: 'rgba(25, 118, 210, 0.04)',
                                            }
                                        }
                                    }}
                                >
                                    <Tab 
                                        label="My Books" 
                                        icon={<DescriptionIcon />} 
                                        iconPosition="start"
                                        sx={{
                                            '& .MuiSvgIcon-root': {
                                                mr: 1,
                                                fontSize: '1.2rem'
                                            }
                                        }}
                                    />
                                    <Tab 
                                        label="Favorites" 
                                        icon={<FavoriteIcon />} 
                                        iconPosition="start"
                                        sx={{
                                            '& .MuiSvgIcon-root': {
                                                mr: 1,
                                                fontSize: '1.2rem'
                                            }
                                        }}
                                    />
                                </Tabs>

                                {activeTab === 0 ? (
                                    <>
                                        {loading ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                                <CircularProgress />
                                            </Box>
                                        ) : currentBooks.length > 0 ? (
                                            <>
                                                <Grid container spacing={3} alignItems="stretch">
                                                    {currentBooks.map((book) => (
                                                        <Grid item xs={12} md={6} key={book.id} sx={{ display: 'flex' }}>
                                                            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                                <Card sx={{ 
                                                                    display: 'flex', 
                                                                    boxShadow: 3, 
                                                                    p: { xs: 1, sm: 2 },
                                                                    width: '100%', 
                                                                    borderRadius: 4,
                                                                    transition: 'transform 0.3s ease-in-out',
                                                                    height: '100%',
                                                                    minHeight: 180,
                                                                    '&:hover': {
                                                                        transform: 'translateY(-5px)',
                                                                        boxShadow: 6
                                                                    }
                                                                }}>
                                                                    <CardMedia
                                                                        component="img"
                                                                        sx={{
                                                                            width: { xs: 90, sm: 120, md: 150 },
                                                                            height: { xs: 120, sm: 160, md: 200 },
                                                                            objectFit: 'cover',
                                                                            bgcolor: '#f5f5f5',
                                                                            border: '1px solid black',
                                                                            borderRadius: 4
                                                                        }}
                                                                        image={book.coverImage || 'https://th.bing.com/th/id/OIP.cB5B7jK44BU3VNazD-SqYgHaHa?rs=1&pid=ImgDetMain'}
                                                                        alt={book.title}
                                                                    />
                                                                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: { xs: 1, sm: 2 } }}>
                                                                        {/* Nút ở trên */}
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                                                            <Chip
                                                                                label={getStatusLabel(book.approvalStatus)}
                                                                                color={getStatusColor(book.approvalStatus)}
                                                                                size="small"
                                                                                sx={{ 
                                                                                    borderRadius: '10px',
                                                                                    fontWeight: 500
                                                                                }}
                                                                            />
                                                                            {!book.isPublic && (
                                                                                <IconButton
                                                                                    onClick={() => handleAccessListClick(book.id)}
                                                                                    color="primary"
                                                                                    sx={{
                                                                                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                                                                        '&:hover': {
                                                                                            backgroundColor: 'rgba(25, 118, 210, 0.12)',
                                                                                        },
                                                                                        borderRadius: '10px',
                                                                                        p: 0.5
                                                                                    }}
                                                                                >
                                                                                    <ListIcon />
                                                                                </IconButton>
                                                                            )}
                                                                            <Typography variant="body2" sx={{ mr: 1 }}>
                                                                                {book.isPublic ? 'Public' : 'Private'}
                                                                            </Typography>
                                                                            <Switch
                                                                                checked={book.isPublic}
                                                                                onChange={() => handleTogglePublic(book)}
                                                                                color={book.isPublic ? 'success' : 'error'}
                                                                                sx={{ ml: 1 }}
                                                                            />
                                                                        </Box>
                                                                        {/* Tên sách */}
                                                                        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.2rem' }, mb: 0.5 }}>
                                                                            {book.title}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                                            by {book.author}
                                                                        </Typography>
                                                                        <Typography variant="body2" sx={{ mb: 0.5 }}>Uploaded: {book.uploadDate}</Typography>
                                                                        <Typography variant="body2" sx={{ mb: 0.5 }}>Size: {book.fileSize}</Typography>
                                                                        <Typography variant="body2" sx={{ mb: 0.5 }}>Courses: {book.courses.join(', ')}</Typography>
                                                                        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                                            {book.wordFile && (
                                                                                <Chip
                                                                                    icon={<DescriptionIcon />}
                                                                                    label="Word"
                                                                                    color="primary"
                                                                                    variant="outlined"
                                                                                    sx={{ 
                                                                                        borderRadius: '10px',
                                                                                        '& .MuiChip-icon': {
                                                                                            color: 'primary.main'
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            )}
                                                                            {book.pdfFile && (
                                                                                <Chip
                                                                                    icon={<PictureAsPdfIcon />}
                                                                                    label="PDF"
                                                                                    color="error"
                                                                                    variant="outlined"
                                                                                    sx={{ 
                                                                                        borderRadius: '10px',
                                                                                        '& .MuiChip-icon': {
                                                                                            color: 'error.main'
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        </Box>
                                                                    </CardContent>
                                                                </Card>
                                                            </Box>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                                    <Pagination
                                                        count={Math.ceil(filteredBooks.length / booksPerPage)}
                                                        page={currentPage}
                                                        onChange={(event, page) => setCurrentPage(page)}
                                                        color="primary"
                                                        shape="rounded"
                                                        size="large"
                                                    />
                                                </Box>
                                            </>
                                        ) : (
                                            <Box sx={{ 
                                                textAlign: 'center', 
                                                py: 10,
                                                background: 'linear-gradient(to bottom right, #f5f5f5, #e0e0e0)',
                                                borderRadius: 4
                                            }}>
                                                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                                                    No books found
                                                </Typography>
                                                <Button 
                                                    variant="outlined" 
                                                    color="primary"
                                                    onClick={() => setOpenUploadDialog(true)}
                                                    sx={{
                                                        borderRadius: '10px',
                                                        px: 3
                                                    }}
                                                >
                                                    Upload Your First Book
                                                </Button>
                                            </Box>
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
                                                <Grid container spacing={3} alignItems="stretch">
                                                    {currentFavorites.map((book) => (
                                                        <Grid item xs={12} md={6} key={book.documentId} sx={{ display: 'flex' }}>
                                                            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                                <Card sx={{ 
                                                                    display: 'flex', 
                                                                    boxShadow: 3, 
                                                                    p: 2, 
                                                                    width: '100%', 
                                                                    borderRadius: 4,
                                                                    transition: 'transform 0.3s ease-in-out',
                                                                    height: '100%',
                                                                    '&:hover': {
                                                                        transform: 'translateY(-5px)',
                                                                        boxShadow: 6
                                                                    }
                                                                }}>
                                                                    <CardMedia
                                                                        component="img"
                                                                        sx={{
                                                                            width: 150,
                                                                            height: 200,
                                                                            objectFit: 'cover',
                                                                            bgcolor: '#f5f5f5',
                                                                            border: '1px solid black',
                                                                            borderRadius: 4
                                                                        }}
                                                                        image={book.coverImage || 'https://th.bing.com/th/id/OIP.cB5B7jK44BU3VNazD-SqYgHaHa?rs=1&pid=ImgDetMain'}
                                                                        alt={book.documentName}
                                                                    />

                                                                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                            <Box>
                                                                                <Typography variant="h6" fontWeight="bold">
                                                                                    {book.documentName}
                                                                                </Typography>
                                                                                <Typography variant="body2" color="text.secondary">
                                                                                    by {book.author}
                                                                                </Typography>
                                                                            </Box>
                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                <IconButton
                                                                                    onClick={() => handleToggleFavorite(book.documentId)}
                                                                                    sx={{
                                                                                        color: 'error.main',
                                                                                        '&:hover': {
                                                                                            color: 'error.dark',
                                                                                            transform: 'scale(1.1)',
                                                                                        },
                                                                                        transition: 'all 0.3s ease',
                                                                                        p: 0.5
                                                                                    }}
                                                                                >
                                                                                    <FavoriteIcon sx={{ fontSize: 28 }} />
                                                                                </IconButton>
                                                                            </Box>
                                                                        </Box>

                                                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                                                            Uploaded: {book.uploadDate}
                                                                        </Typography>
                                                                        <Typography variant="body2">
                                                                            Size: {book.fileSize}
                                                                        </Typography>

                                                                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                                                            {book.wordFile && (
                                                                                <Chip
                                                                                    icon={<DescriptionIcon />}
                                                                                    label="Word"
                                                                                    color="primary"
                                                                                    variant="outlined"
                                                                                    sx={{ 
                                                                                        borderRadius: '10px',
                                                                                        '& .MuiChip-icon': {
                                                                                            color: 'primary.main'
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            )}
                                                                            {book.pdfFile && (
                                                                                <Chip
                                                                                    icon={<PictureAsPdfIcon />}
                                                                                    label="PDF"
                                                                                    color="error"
                                                                                    variant="outlined"
                                                                                    sx={{ 
                                                                                        borderRadius: '10px',
                                                                                        '& .MuiChip-icon': {
                                                                                            color: 'error.main'
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        </Box>
                                                                    </CardContent>
                                                                </Card>
                                                            </Box>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                                    <Pagination
                                                        count={Math.ceil(favoriteBooks.length / 10)}
                                                        page={favoritesPage + 1}
                                                        onChange={(event, page) => setFavoritesPage(page - 1)}
                                                        color="primary"
                                                        shape="rounded"
                                                        size="large"
                                                    />
                                                </Box>
                                            </>
                                        ) : (
                                            <Box sx={{ 
                                                textAlign: 'center', 
                                                py: 10,
                                                background: 'linear-gradient(to bottom right, #f5f5f5, #e0e0e0)',
                                                borderRadius: 3
                                            }}>
                                                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                                                    No favorite books found
                                                </Typography>
                                            </Box>
                                        )}
                                    </>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Scroll to Top Button */}
                    <Zoom in={showScrollTop}>
                        <Fab
                            color="primary"
                            aria-label="scroll to top"
                            onClick={scrollToTop}
                            sx={{
                                position: 'fixed',
                                bottom: 96,
                                right: 24,
                                zIndex: 1000,
                                width: 56,
                                height: 56,
                                '&:hover': {
                                    backgroundColor: 'secondary.main'
                                }
                            }}
                        >
                            <KeyboardArrowUpIcon />
                        </Fab>
                    </Zoom>
                </Container>
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

            {/* Add AccessList Dialog */}
            {selectedDigitalId && (
                <AccessList
                    open={accessListOpen}
                    onClose={handleAccessListClose}
                    uploadId={selectedDigitalId}
                />
            )}
        </Box>
    );
};

export default MyBookShelf;