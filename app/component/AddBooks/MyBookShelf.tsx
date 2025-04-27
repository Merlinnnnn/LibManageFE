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
    DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddIcon from '@mui/icons-material/Add';
import Header from '../Home/Header';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';

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

interface DocumentType {
    id: number;
    name: string;
}

interface Course {
    id: number;
    name: string;
}

const MyBookShelf: React.FC = () => {
    const theme = useTheme();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [openUploadDialog, setOpenUploadDialog] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<number[]>([]);
    const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [bookToToggle, setBookToToggle] = useState<Book | null>(null);

    const booksPerPage = 5;

    // Calculate currentBooks based on pagination
    const currentBooks = books.slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage);

    // Mock data functions
    const fetchMockBooks = (): Promise<Book[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: '1',
                        title: 'Kinh tế học đại cương',
                        author: 'Nguyễn Văn A',
                        coverImage: 'https://marketplace.canva.com/EAD46HNrYBs/1/0/1003w/canva-an-%E1%BB%A7i-l%C3%A1ng-m%E1%BA%A1n-s%C3%A1ch-b%C3%ACa-naZIEWMJArU.jpg',
                        uploadDate: '2023-05-15',
                        fileSize: '2.4 MB',
                        documentType: 'Textbook',
                        courses: ['Kinh tế học đại cương'],
                        isPublic: true,
                        pdfFile: '/sample.pdf',
                        wordFile: '/sample.docx' // Added Word file
                    },
                    {
                        id: '2',
                        title: 'Nhập môn quản trị chất lượng',
                        author: 'Trần Thị B',
                        coverImage: 'https://lienketbank.com/wp-content/uploads/2023/05/canva-vang-nau-chim-hinh-minh-hoa-nho-be-tre-em-sach-bia-cptvdrYhx3Y.jpg',
                        uploadDate: '2023-06-20',
                        fileSize: '3.1 MB',
                        documentType: 'Textbook',
                        courses: ['Nhập môn quản trị chất lượng'],
                        isPublic: false,
                        wordFile: '/sample.docx',
                        mp4File: '/sample.mp4' // Added MP4 file
                    },
                    {
                        id: '3',
                        title: 'Nhập môn Quản trị học',
                        author: 'Lê Văn C',
                        coverImage: 'https://img.hoidap247.com/picture/question/20211207/large_1638878507491.jpg',
                        uploadDate: '2023-07-10',
                        fileSize: '1.8 MB',
                        documentType: 'Textbook',
                        courses: ['Nhập môn Quản trị học'],
                        isPublic: true,
                        mp4File: '/sample.mp4',
                        pdfFile: '/sample.pdf' // Added PDF file
                    },
                    {
                        id: '4',
                        title: 'Nhập môn Logic học',
                        author: 'Phạm Thị D',
                        coverImage: 'https://th.bing.com/th/id/OIP.FrtC3s5nDAGQRZrrfYmgUQHaL0?rs=1&pid=ImgDetMain',
                        uploadDate: '2023-08-05',
                        fileSize: '2.2 MB',
                        documentType: 'Textbook',
                        courses: ['Nhập môn Logic học'],
                        isPublic: false,
                        pdfFile: '/sample.pdf',
                        wordFile: '/sample.docx', // Added Word file
                        mp4File: '/sample.mp4' // Added MP4 file
                    },
                    {
                        id: '5',
                        title: 'Công cụ và môi trường phát triển PM',
                        author: 'Hoàng Văn E',
                        coverImage: 'https://marketplace.canva.com/EAD47gw3gaM/1/0/1003w/canva-%C4%91en-v%C3%A0-tr%E1%BA%AFng-b%E1%BA%A3nh-bao-c%E1%BB%95-%C4%91i%E1%BB%83n-b%C3%ACa-s%C3%A1ch-th%E1%BB%9Di-trang-GHHfZfJHIFQ.jpg',
                        uploadDate: '2023-09-12',
                        fileSize: '4.0 MB',
                        documentType: 'Textbook',
                        courses: ['Công cụ và môi trường phát triển PM'],
                        isPublic: true,
                        wordFile: '/sample.docx'
                    }
                ]);
            }, 800);
        });
    };
    const fetchMockDocumentTypes = (): Promise<DocumentType[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { id: 1, name: 'Fiction' },
                    { id: 2, name: 'Science' },
                    { id: 3, name: 'History' },
                    { id: 4, name: 'Technology' }
                ]);
            }, 500);
        });
    };

    const fetchMockCourses = (): Promise<Course[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { id: 1, name: 'Kinh tế học đại cương' },
                    { id: 2, name: 'Nhập môn quản trị chất lượng' },
                    { id: 3, name: 'Nhập môn Quản trị học' },
                    { id: 4, name: 'Nhập môn Logic học' },
                    { id: 5, name: 'Công cụ và môi trường phát triển PM' },
                    { id: 6, name: 'Nhập môn lập trình' },
                    { id: 7, name: 'Toán rời rạc' },
                    { id: 8, name: 'Cấu trúc dữ liệu' },
                    { id: 9, name: 'Lập trình hướng đối tượng' },
                    { id: 10, name: 'Xác suất thống kê' },
                    { id: 11, name: 'Thuật toán' },
                    { id: 12, name: 'Hệ điều hành' },
                    { id: 13, name: 'Mạng máy tính' },
                    { id: 14, name: 'Cơ sở dữ liệu' },
                    { id: 15, name: 'Trí tuệ nhân tạo' },
                    { id: 16, name: 'Introduction to Computer Science' }
                ]);
            }, 500);
        });
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const [booksData, typesData, coursesData] = await Promise.all([
                    fetchMockBooks(),
                    fetchMockDocumentTypes(),
                    fetchMockCourses()
                ]);

                setBooks(booksData);
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

    const handleDocumentTypeToggle = (typeId: number) => {
        setSelectedDocumentTypes(prev =>
            prev.includes(typeId)
                ? prev.filter(id => id !== typeId)
                : [...prev, typeId]
        );
    };

    return (
        <Box>
            <Header />
            <Box sx={{ padding: '20px', display: 'flex', gap: '20px' }}>
                {/* Left Sidebar - Filters */}
                <Paper sx={{ padding: '20px', width: '300px', flexShrink: 0 }}>
                    <Typography variant="h6" gutterBottom>
                        Select Type
                    </Typography>
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

                    <Typography variant="h6" gutterBottom>
                        Select Courses
                    </Typography>
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

                {/* Right Side - Book List */}
                <Paper sx={{ padding: '20px', flexGrow: 1 }}>
                    {/* Search and Upload Section */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <TextField
                            variant="outlined"
                            placeholder="Search your books..."
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
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenUploadDialog(true)}
                        >
                            Upload New Book
                        </Button>
                    </Box>

                    {/* Book List */}
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
                                                image={book.coverImage || '/no-cover.png'}
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

                                                {/* File action buttons */}
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
                            Không tìm thấy dữ liệu.
                        </Typography>
                    )}
                </Paper>
            </Box>

            {/* Confirmation Dialog */}
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
        </Box>
    );
};

export default MyBookShelf;