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
  Drawer,
  Chip,
  Button,
  IconButton,
  Avatar,
  Container,
  Divider,
  Badge,
  Fab,
  Zoom
} from '@mui/material';
import Skeleton from '../Skeleton/Skeleton';
import apiService from '../../untils/api';
import Header from '../Home/Header';
import BookDetail from './BookDetail';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import BookInfo from './BookInfo';
import FilterListIcon from '@mui/icons-material/FilterList';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import CategoryIcon from '@mui/icons-material/Category';
import SchoolIcon from '@mui/icons-material/School';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import startTour from '../Tutorial/tutorial';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

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

interface BooksApiResponse {
  code: number;
  message: string;
  data: {
    content: Book[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
}

interface FilterApiResponse {
  content: Book[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

interface SearchApiResponse {
  documentId: number;
  isbn: string;
  documentName: string;
  author: string;
  publisher: string;
  publishedDate: string | null;
  language: string | null;
  price: number;
  quantity: number;
  description: string;
  coverImage: string | null;
  documentCategory: string;
  summary: string;
  approvalStatus: string;
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
    visibilityStatus: string;
    uploads: Upload[];
  } | null;
}

interface DocumentTypeRes {
  code: number;
  message: string;
  data: {
    content: DocumentType[]
  };
}

interface CourseRes {
  code: number;
  message: string;
  data: {
    content: Course[];
  };
}

interface RecommendationsResponse {
  code: number;
  message: string;
  data: {
    content: Book[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
    sortDetails: any[];
  };
}

export default function BookShelf() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchString, setSearchString] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [openDetailDiolog, setOpenDetailDiolog] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openTypeFilter, setOpenTypeFilter] = useState(true);
  const [openCourseFilter, setOpenCourseFilter] = useState(true);
  const [programBooks, setProgramBooks] = useState<Book[]>([]);
  const [currentProgramSlide, setCurrentProgramSlide] = useState(0);

  const booksPerPage = 10;
  const muiTheme = useTheme();

  const handleTypeToggle = (typeId: number) => {
    setSelectedTypes((prev) => {
      const newTypes = prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId];
      return newTypes;
    });
  };

  const fetchCoursesAndTypes = async () => {
    setLoading(true);
    try {
      const [coursesResponse, typesResponse] = await Promise.all([
        apiService.get<CourseRes>('/api/v1/courses'),
        apiService.get<DocumentTypeRes>('/api/v1/document-types'),
      ]);

      if (coursesResponse?.data?.data?.content) {
        setCourses(coursesResponse.data.data.content);
      }

      if (typesResponse?.data?.data?.content) {
        setDocumentTypes(typesResponse.data.data.content || []);
      }
    } catch (error) {
      console.log('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesAndTypes();
  }, []);

  const handleCourseToggle = (courseId: number) => {
    setSelectedCourses((prev) => {
      const newCourses = prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId];
      return newCourses;
    });
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const fetchBooks = async () => {
    setLoading(true);
    setBooks([]);
    try {
      const params: Record<string, any> = {
        size: booksPerPage,
        page: currentPage
      };

      if (searchString) params.documentName = searchString;
      if (selectedTypes?.length) params.documentTypeIds = selectedTypes.join(',');
      if (selectedCourses?.length) params.courseIds = selectedCourses.join(',');

      const response = await apiService.get<BooksApiResponse>('/api/v1/documents', { params });
      console.log(response);
      if (response.data?.data) {
        setBooks(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
        // Set first 3 books as featured
        setFeaturedBooks(response.data.data.content.slice(0, 3));
      }
    } catch (error) {
      console.log('Lỗi khi tải sách:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    window.scrollTo(0, 0);
  }, [currentPage, searchString]);

  const handleViewDocument = (id: string) => {
    setOpenDetailDiolog(true);
    setSelectedBookId(id);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value - 1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

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
    } else if (selectedTypes.length > 0 || selectedCourses.length > 0) {
      filterBooks();
    } else {
      fetchBooks();
    }
  };

  const handleSearchIconClick = () => {
    setSearchString(searchQuery);
  };

  const handleCloseDialog = () => {
    setSelectedBookId(null);
  };

  const handleFileOpen = (fileUrl: string, digitalDocumentId: number) => {
    // Convert backslash to forward slash for URLs
    const formattedUrl = fileUrl.replace(/\\/g, '/');
    window.open(`/api/v1/digital-documents/${digitalDocumentId}/download?filePath=${encodeURIComponent(formattedUrl)}`, '_blank');
  };

  const renderFileButtons = (book: Book) => {
    if (book.documentCategory === 'DIGITAL' && book.digitalDocument?.uploads) {
      const hasPdf = book.digitalDocument.uploads.some(upload => 
        upload.fileType === 'application/pdf' || upload.fileType === 'pdf'
      );
      const hasWord = book.digitalDocument.uploads.some(upload => 
        upload.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        upload.fileType === 'application/msword' ||
        upload.fileType === 'docx' ||
        upload.fileType === 'doc'
      );

      return (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {hasPdf && (
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
          {hasWord && (
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
          <Button
            variant="outlined"
            color="success"
            //startIcon={<LocalLibraryIcon />}
            onClick={() => handleViewDocument(book.documentId.toString())}
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
            Chi tiết
          </Button>
        </Box>
      );
    }
    return (
      <Button
        variant="outlined"
        color="success"
        startIcon={<LocalLibraryIcon />}
        onClick={() => handleViewDocument(book.documentId.toString())}
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
        Chi tiết
      </Button>
    );
  };

  const searchBooks = async (title: string) => {
    setLoading(true);
    try {
      const response = await apiService.get<BooksApiResponse>(`/api/v1/documents/search?title=${encodeURIComponent(title)}`);

      if (response.data?.data?.content) {
        setBooks(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
        setCurrentPage(0);
      }
    } catch (error) {
      console.log('Lỗi khi tìm kiếm sách:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};

      if (selectedTypes.length > 0) {
        params.documentTypeIds = selectedTypes.join(',');
      }

      if (selectedCourses.length > 0) {
        params.courseIds = selectedCourses.join(',');
      }

      // // Add pagination parameters
      // params.page = currentPage.toString();
      // params.size = booksPerPage.toString();

      const response = await apiService.get<FilterApiResponse>('/api/v1/documents/filter', { params });

      if (response.data) {
        setBooks(response.data.content);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.log('Lỗi khi lọc sách:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await apiService.get<RecommendationsResponse>('/api/v1/recommendations/ml');
      if (response.data?.data?.content) {
        setRecommendedBooks(response.data.data.content);
      }
    } catch (error) {
      console.log('Lỗi khi tải sách đề xuất:', error);
    }
  };

  const fetchProgramRecommendations = async () => {
    try {
      const response = await apiService.get<RecommendationsResponse>('/api/v1/recommendations/program');
      if (response.data?.data?.content) {
        setProgramBooks(response.data.data.content);
      }
    } catch (error) {
      console.log('Lỗi khi tải sách học kỳ:', error);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    fetchProgramRecommendations();
  }, []);

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

  // Modify the useEffect for filter
  useEffect(() => {
    if (selectedTypes.length > 0 || selectedCourses.length > 0) {
      filterBooks();
    } else {
      fetchBooks();
    }
  }, [selectedTypes, selectedCourses]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => Math.min(Math.ceil(recommendedBooks.length / 3) - 1, prev + 1));
  };

  // useEffect(() => {
  //   startTour();
  // }, []);

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
          {/* Giảm padding hai bên */}
          {/* Nếu cần, có thể dùng maxWidth="lg" hoặc disableGutters */}
          {/* <Container maxWidth="lg" disableGutters sx={{ px: 1 }}> */}
          {/* Hero Section */}
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
              Khám Phá Thư Viện Số Của Chúng Tôi
            </Typography>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Khám phá hàng ngàn sách, bài báo và tài nguyên học tập
            </Typography>

            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              maxWidth: 600,
              mx: 'auto'
            }}>
              <TextField
                id="search-box"
                fullWidth
                variant="outlined"
                placeholder="Tìm kiếm sách, tác giả, môn học..."
                size="medium"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyPress}
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 2,
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

          {/* Featured Books Carousel */}
          {recommendedBooks.length > 0 && (
            <Box id="recommended-books" sx={{ mb: 6, position: 'relative' }}>
              <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <StarIcon color="secondary" sx={{ mr: 1 }} />
                Sách Đề Cử Cho Bạn
              </Typography>
              
              {/* Navigation Buttons */}
              <IconButton
                onClick={handlePrevSlide}
                disabled={currentSlide === 0}
                sx={{
                  position: 'absolute',
                  left: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  '&:hover': {
                    bgcolor: 'background.paper',
                  },
                  zIndex: 2,
                  display: { xs: 'none', md: 'flex' }
                }}
              >
                <KeyboardArrowLeftIcon />
              </IconButton>
              
              <IconButton
                onClick={handleNextSlide}
                disabled={currentSlide >= Math.ceil(recommendedBooks.length / 3) - 1}
                sx={{
                  position: 'absolute',
                  right: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  '&:hover': {
                    bgcolor: 'background.paper',
                  },
                  zIndex: 2,
                  display: { xs: 'none', md: 'flex' }
                }}
              >
                <KeyboardArrowRightIcon />
              </IconButton>

              <Box sx={{
                overflow: 'hidden',
                position: 'relative',
                mx: { xs: -2, md: 0 }
              }}>
                <Box sx={{
                  display: 'flex',
                  transition: 'transform 0.3s ease-in-out',
                  transform: `translateX(-${currentSlide * 100}%)`,
                  width: '100%'
                }}>
                  {Array.from({ length: Math.ceil(recommendedBooks.length / 3) }).map((_, groupIndex) => (
                    <Box
                      key={groupIndex}
                      sx={{
                        minWidth: '100%',
                        display: 'flex',
                        gap: 2,
                        px: 2
                      }}
                    >
                      {recommendedBooks.slice(groupIndex * 3, (groupIndex + 1) * 3).map((book) => (
                        <Paper
                          key={book.documentId}
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            height: '100%',
                            transition: 'transform 0.3s',
                            width: 'calc(33.333% - 16px)',
                            flex: '0 0 auto',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: 6
                            },
                            background: 'linear-gradient(to bottom right, #ffffff, #f3e5f5)'
                          }}
                        >
                          <Box sx={{ display: 'flex', mb: 2 }}>
                            <Avatar
                              src={book.coverImage || ''}
                              variant="rounded"
                              sx={{
                                width: 70,
                                height: 100,
                                mr: 2,
                                boxShadow: 3
                              }}
                            />
                            <Box>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 600,
                                fontSize: '1rem',
                                lineHeight: 1.2,
                                mb: 0.5
                              }}>
                                {book.documentName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                Tác giả: {book.author}
                              </Typography>
                              <Chip
                                label={book.documentCategory}
                                size="small"
                                color="primary"
                                sx={{ mt: 1, height: 24 }}
                              />
                            </Box>
                          </Box>
                          <Typography variant="body2" sx={{ 
                            mb: 2,
                            fontSize: '0.875rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {book?.description || 'Không có mô tả'}
                          </Typography>
                          {renderFileButtons(book)}
                        </Paper>
                      ))}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}

          {/* Program Books Recommendation Section */}
          {programBooks.length > 0 && (
            <Box id="program-books" sx={{ mb: 6, position: 'relative' }}>
              <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <SchoolIcon color="secondary" sx={{ mr: 1 }} />
                Sách Có Thể Học Trong Kỳ Này
              </Typography>
              {/* Navigation Buttons */}
              <IconButton
                onClick={() => setCurrentProgramSlide((prev) => Math.max(0, prev - 1))}
                disabled={currentProgramSlide === 0}
                sx={{
                  position: 'absolute',
                  left: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  '&:hover': {
                    bgcolor: 'background.paper',
                  },
                  zIndex: 2,
                  display: { xs: 'none', md: 'flex' }
                }}
              >
                <KeyboardArrowLeftIcon />
              </IconButton>
              <IconButton
                onClick={() => setCurrentProgramSlide((prev) => Math.min(Math.ceil(programBooks.length / 3) - 1, prev + 1))}
                disabled={currentProgramSlide >= Math.ceil(programBooks.length / 3) - 1}
                sx={{
                  position: 'absolute',
                  right: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  '&:hover': {
                    bgcolor: 'background.paper',
                  },
                  zIndex: 2,
                  display: { xs: 'none', md: 'flex' }
                }}
              >
                <KeyboardArrowRightIcon />
              </IconButton>
              <Box sx={{
                overflow: 'hidden',
                position: 'relative',
                mx: { xs: -2, md: 0 }
              }}>
                <Box sx={{
                  display: 'flex',
                  transition: 'transform 0.3s ease-in-out',
                  transform: `translateX(-${currentProgramSlide * 100}%)`,
                  width: '100%'
                }}>
                  {Array.from({ length: Math.ceil(programBooks.length / 3) }).map((_, groupIndex) => (
                    <Box
                      key={groupIndex}
                      sx={{
                        minWidth: '100%',
                        display: 'flex',
                        gap: 2,
                        px: 2
                      }}
                    >
                      {programBooks.slice(groupIndex * 3, (groupIndex + 1) * 3).map((book) => (
                        <Paper
                          key={book.documentId}
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            height: '100%',
                            transition: 'transform 0.3s',
                            width: 'calc(33.333% - 16px)',
                            flex: '0 0 auto',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: 6
                            },
                            background: 'linear-gradient(to bottom right, #ffffff, #e3eaf5)'
                          }}
                        >
                          <Box sx={{ display: 'flex', mb: 2 }}>
                            <Avatar
                              src={book.coverImage || ''}
                              variant="rounded"
                              sx={{
                                width: 70,
                                height: 100,
                                mr: 2,
                                boxShadow: 3
                              }}
                            />
                            <Box>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 600,
                                fontSize: '1rem',
                                lineHeight: 1.2,
                                mb: 0.5
                              }}>
                                {book.documentName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                Tác giả: {book.author}
                              </Typography>
                              <Chip
                                label={book.documentCategory}
                                size="small"
                                color="primary"
                                sx={{ mt: 1, height: 24 }}
                              />
                            </Box>
                          </Box>
                          <Typography variant="body2" sx={{ 
                            mb: 2,
                            fontSize: '0.875rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {book?.description || 'Không có mô tả'}
                          </Typography>
                          {renderFileButtons(book)}
                        </Paper>
                      ))}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}

          {/* Main Content */}
          <Grid container spacing={4}>
            {/* Filters Sidebar */}
            <Grid item xs={12} md={2.5}>
              <Paper id="filter-section" sx={{
                p: 3,
                borderRadius: 3,
                position: 'sticky',
                top: { xs: 20, sm: 28 },
                boxShadow: 3,
                maxHeight: 'calc(100vh - 100px)',
                overflowY: 'auto',
                minWidth: 320,
                width: '100%',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <FilterListIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Bộ Lọc</Typography>
                </Box>

                {/* Loại tài liệu filter với expand/collapse */}
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', mb: 1, cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => setOpenTypeFilter((prev) => !prev)}
                  >
                    <CategoryIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="subtitle1" sx={{ flex: 1 }}>Loại Tài Liệu</Typography>
                    {openTypeFilter ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>
                  {openTypeFilter && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {documentTypes.map((type) => (
                        <Chip
                          key={type.documentTypeId}
                          label={type.typeName}
                          clickable
                          variant={selectedTypes.includes(type.documentTypeId) ? 'filled' : 'outlined'}
                          color={selectedTypes.includes(type.documentTypeId) ? 'primary' : 'default'}
                          onClick={() => handleTypeToggle(type.documentTypeId)}
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Môn học filter với expand/collapse */}
                <Box>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', mb: 1, cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => setOpenCourseFilter((prev) => !prev)}
                  >
                    <SchoolIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="subtitle1" sx={{ flex: 1 }}>Môn Học</Typography>
                    {openCourseFilter ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>
                  {openCourseFilter && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {courses.map((course) => (
                        <Chip
                          key={course.courseId}
                          label={course.courseName}
                          clickable
                          variant={selectedCourses.includes(course.courseId) ? 'filled' : 'outlined'}
                          color={selectedCourses.includes(course.courseId) ? 'primary' : 'default'}
                          onClick={() => handleCourseToggle(course.courseId)}
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                {/* <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  sx={{ mt: 3, borderRadius: 2 }}
                  onClick={handleSearchButton}
                >
                  Áp Dụng Bộ Lọc
                </Button> */}
              </Paper>
            </Grid>

            {/* Books List */}
            <Grid item xs={12} md={9.5}>
              <Paper id="book-list" sx={{
                p: { xs: 0.5, sm: 1.5, md: 2 },
                borderRadius: 3,
                minHeight: '60vh',
                boxShadow: 3,
                width: '100%',
                maxWidth: '100%',
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocalLibraryIcon color="primary" sx={{ mr: 1 }} />
                    {searchString ? `Kết quả tìm kiếm cho "${searchString}"` : 'Tất Cả Sách'}
                  </Typography>
                  <Typography color="text.secondary" sx={{ 
                                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: '15px',
                                        fontSize: '0.9rem'
                                    }}>
                    Tìm thấy {books.length} {books.length === 1 ? 'quyển sách' : 'quyển sách'}
                  </Typography>
                </Box>

                {loading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[...Array(3)].map((_, index) => (
                      <Skeleton key={index} />
                    ))}
                  </Box>
                ) : books.length > 0 ? (
                  <Box sx={{ mb: 4 }}>
                    <Grid container spacing={3} alignItems="stretch">
                      {books.map((book) => (
                        <Grid item xs={12} md={6} key={book?.documentId} sx={{ display: 'flex' }}>
                          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <BookInfo 
                                id={book?.documentId?.toString() || ''} 
                                books={books} 
                                onTitleClick={(id) => {
                                    setOpenDetailDiolog(true);
                                    setSelectedBookId(id);
                                }}
                            />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                    <Box id="pagination" sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Pagination
                        count={totalPages}
                        page={currentPage + 1}
                        onChange={handlePageChange}
                        color="primary"
                        shape="rounded"
                        size="large"
                      />
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{
                    textAlign: 'center',
                    py: 10,
                    background: 'linear-gradient(to bottom right, #f5f5f5, #e0e0e0)',
                    borderRadius: 3
                  }}>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                      Không tìm thấy sách phù hợp với tiêu chí của bạn
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        setSearchString('');
                        setSearchQuery('');
                        setSelectedTypes([]);
                        setSelectedCourses([]);
                      }}
                    >
                      Xóa Bộ Lọc
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
          <BookDetail id={selectedBookId as string} open={openDetailDiolog} onClose={() => setOpenDetailDiolog(false)} />

          {/* Add Scroll to Top Button */}
          <Zoom in={showScrollTop}>
            <Fab
              color="primary"
              size="medium"
              onClick={scrollToTop}
              sx={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                zIndex: 1000,
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
    </Box>
  );
}