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
  Badge
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

// Custom theme with vibrant colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#6a1b9a',
    },
    secondary: {
      main: '#ff8f00',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
});

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

interface Course {
  courseId: number;
  courseName: string;
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

interface DocumentType {
  documentTypeId: number;
  typeName: string;
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
  const [openDetailDiolog, setOpenDetailDiolog] = useState(false)

  const booksPerPage = 5;
  const muiTheme = useTheme();

  const handleTypeToggle = (typeId: number) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]
    );
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
      console.log('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesAndTypes();
  }, []);

  const handleCourseToggle = (courseId: number) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
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
      
      if (response.data?.data) {
        setBooks(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
        // Set first 3 books as featured
        setFeaturedBooks(response.data.data.content.slice(0, 3));
      }
    } catch (error) {
      console.log('Error loading books:', error);
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
      setSearchString(searchQuery);
    }
  };

  const handleSearchButton = () => {
    setSearchString(searchQuery);
  };

  const handleSearchIconClick = () => {
    setSearchString(searchQuery);
  };

  const handleCloseDialog = () => {
    setSelectedBookId(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <Header />
      <Box sx={{ 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh',
        py: 4
      }}>
        <Container maxWidth="xl">
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
              Explore Our Digital Library
            </Typography>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Discover thousands of books, articles and resources
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
                placeholder="Search books, authors, courses..."
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
                      Search
                    </Button>
                  )
                }}
              />
            </Box>
          </Box>

          {/* Featured Books Carousel */}
          {featuredBooks.length > 0 && (
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <StarIcon color="secondary" sx={{ mr: 1 }} />
                Featured Books
              </Typography>
              <Grid container spacing={3}>
                {featuredBooks.map((book) => (
                  <Grid item xs={12} md={4} key={book.documentId}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        borderRadius: 3,
                        height: '100%',
                        transition: 'transform 0.3s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: 6
                        },
                        background: 'linear-gradient(to bottom right, #ffffff, #f3e5f5)'
                      }}
                    >
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        <Avatar 
                          src={book.coverImage} 
                          variant="rounded"
                          sx={{ 
                            width: 80, 
                            height: 120,
                            mr: 2,
                            boxShadow: 3
                          }}
                        />
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {book.documentName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            by {book.author}
                          </Typography>
                          <Chip 
                            label={book.documentCategory} 
                            size="small" 
                            color="primary"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {book.description.length > 100 
                          ? `${book.description.substring(0, 100)}...` 
                          : book.description}
                      </Typography>
                      <Button
                        variant="outlined"
                        color="primary"
                        fullWidth
                        onClick={() => handleViewDocument(book.documentId.toString())}
                        sx={{ borderRadius: 2 }}
                      >
                        View Details
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Main Content */}
          <Grid container spacing={4}>
            {/* Filters Sidebar */}
            <Grid item xs={12} md={3}>
              <Paper sx={{ 
                p: 3, 
                borderRadius: 3,
                position: 'sticky',
                top: 20,
                boxShadow: 3
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <FilterListIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Filters</Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CategoryIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="subtitle1">Document Types</Typography>
                  </Box>
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
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SchoolIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="subtitle1">Courses</Typography>
                  </Box>
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
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  sx={{ mt: 3, borderRadius: 2 }}
                  onClick={handleSearchButton}
                >
                  Apply Filters
                </Button>
              </Paper>
            </Grid>

            {/* Books List */}
            <Grid item xs={12} md={9}>
              <Paper sx={{ 
                p: 3, 
                borderRadius: 3,
                minHeight: '60vh',
                boxShadow: 3
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocalLibraryIcon color="primary" sx={{ mr: 1 }} />
                    {searchString ? `Search Results for "${searchString}"` : 'All Books'}
                  </Typography>
                  <Typography color="text.secondary">
                    {books.length} {books.length === 1 ? 'book' : 'books'} found
                  </Typography>
                </Box>

                {loading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[...Array(3)].map((_, index) => (
                      <Skeleton key={index} />
                    ))}
                  </Box>
                ) : books.length > 0 ? (
                  <>
                    <Box sx={{ mb: 4 }}>
                      {books.map((book) => (
                        <Box key={book.documentId} mb={3}>
                          <BookInfo id={book.documentId.toString()} books={books} />
                        </Box>
                      ))}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Pagination
                        count={totalPages}
                        page={currentPage + 1}
                        onChange={handlePageChange}
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
                      No books found matching your criteria
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
                      Clear Filters
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        <BookDetail id={selectedBookId as string} open={openDetailDiolog} onClose={() => setOpenDetailDiolog(false)} />

        </Container>

      </Box>
    </ThemeProvider>
  );
}