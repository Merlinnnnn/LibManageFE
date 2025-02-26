import React, { useState, useEffect } from 'react';
import { Grid, Box, Pagination, CircularProgress, Typography, Paper, TextField, InputAdornment, useTheme, Drawer, Chip, Button, IconButton } from '@mui/material';
import BookCard from './BookCard';
import apiService from '../../untils/api';
import Header from '../Home/Header';
import BookDetail from './BookDetail';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';

interface Book {
  documentId: number;
  documentName: string;
  cover?: string;
  author?: string;
  publisher?: string;
  isbn?: string;
  documentLink: string;
}
interface Course {
  courseId: number; // Changed to courseId
  courseName: string;
}

interface BooksApiResponse {
  code: number;
  message: string;
  result: {
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
  result: {
    content: DocumentType[]
  };
}
interface CourseRes {
  code: number;
  message: string;
  result: {
    content: Course[];
  };
}

export default function BookShelf() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');  // searchQuery để thao tác với API
  const [searchString, setSearchString] = useState<string>(''); // searchString để theo dõi chuỗi tìm kiếm
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const booksPerPage = 20;
  const theme = useTheme();
  const handleTypeToggle = (typeId: number) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]
    );
  };
  // Sử dụng async/await để fetch Courses và Document Types
  const fetchCoursesAndTypes = async () => {
    try {
      const [coursesResponse, typesResponse] = await Promise.all([
        apiService.get<CourseRes>('/api/v1/courses'),
        apiService.get<DocumentTypeRes>('/api/v1/document-types'),
      ]);

      // Xử lý Courses
      if (coursesResponse?.data?.result?.content) {
        setCourses(coursesResponse.data.result.content);
      } else {
        setCourses([]); // Reset nếu không có dữ liệu
        console.warn('Courses data is empty or invalid.');
      }

      // Xử lý Document Types
      if (typesResponse?.data?.result?.content) {
        setDocumentTypes(typesResponse.data.result.content || []);
      } else {
        setDocumentTypes([]); // Reset nếu không có dữ liệu
        console.warn('Document types data is empty or invalid.');
      }
    } catch (error) {
      console.log('Error fetching courses or document types:', error);
      setCourses([]); // Reset dữ liệu khi có lỗi
      setDocumentTypes([]);
    }
  };

  // Gọi hàm fetchCoursesAndTypes trong useEffect
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


  // Fetch books when page changes or search query changes
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};

      if (searchString) {
        params.documentName = searchString;
      }
      if (selectedTypes?.length) {
        params.documentTypeIds = selectedTypes.join(',');
      }
      if (selectedCourses?.length) {
        params.courseIds = selectedCourses.join(',');
      }
      if (booksPerPage) {
        params.size = booksPerPage;
      }
      if (currentPage) {
        params.page = currentPage;
      }
      const response = await apiService.get<BooksApiResponse>('/api/v1/documents/search', {
        params,
      });

      if (response.data && response.data.result) {
        setBooks(response.data.result.content);
        setTotalPages(response.data.result.totalPages);
      } else {
        setBooks([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.log('Không thể tải sách:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [currentPage, searchString]);  // Thêm searchString vào dependency array để re-fetch khi searchString thay đổi

  const handleViewDocument = (id: string, imgLink: string) => {
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
      setSearchString(searchQuery); // Cập nhật searchString khi nhấn Enter
    }
  };
  const handleSearchButton = (searchString: string) => {
    setSearchString(searchString);
    fetchBooks();
    console.log(selectedCourses);
    console.log(selectedTypes);
  }

  const handleSearchIconClick = () => {
    setSearchString(searchQuery); // Cập nhật searchString khi nhấn vào biểu tượng tìm kiếm
  };

  const handleCloseDialog = () => {
    setSelectedBookId(null);
  };
  interface DocumentType {
    documentTypeId: number;
    typeName: string;
  }
  return (
    <Box>
      <Header />
      <Box sx={{ padding: '20px' }}>
        {/* Paper container for the book list */}
        <Paper sx={{ padding: '20px', position: 'relative' }}>
        <IconButton  onClick={toggleDrawer}>
                      <MenuIcon />
                    </IconButton>
          {/* Thanh tìm kiếm */}
          <Box
            sx={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              right: '20px',
              display: 'flex',
              justifyContent: 'flex-start',
              marginLeft: '40px',
              zIndex: 1,
            }}
          >
          {/* <IconButton onClick={toggleDrawer}>
                      <MenuIcon />
                    </IconButton> */}
            <TextField
              variant="outlined"
              placeholder="Search..."
              size="small"
              value={searchQuery}
              onChange={handleSearchChange} // Cập nhật searchQuery khi nhập liệu
              onKeyDown={handleSearchKeyPress} // Xử lý sự kiện nhấn phím Enter
              sx={{
                width: '100%',
                maxWidth: '400px',  // Max width for larger screens
                backgroundColor: theme.palette.background.default,
                borderRadius: '20px',
                '& fieldset': {
                  borderRadius: '20px',
                },
                '& input': {
                  color: theme.palette.text.primary,
                },
                '& .MuiSvgIcon-root': {
                  color: theme.palette.text.primary,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {/* <IconButton onClick={toggleDrawer}>
                      <MenuIcon />
                    </IconButton> */}
                    <SearchIcon onClick={handleSearchIconClick} /> {/* Xử lý sự kiện khi click vào SearchIcon */}
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          {/* <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
            <Box width={300} p={2}>
              <Typography variant="h6">Select Type</Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                {documentTypes.map((type) => (
                  <Chip
                    key={type.documentTypeId}
                    label={type.typeName}
                    clickable
                    color={selectedTypes.includes(type.documentTypeId) ? 'primary' : 'default'}
                    onClick={() => handleTypeToggle(type.documentTypeId)}
                  />
                ))}
              </Box>

              <Typography variant="h6" mt={2}>Select Courses</Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                {courses.map((course) => (
                  <Chip
                    key={course.courseId}
                    label={course.courseName}
                    clickable
                    color={selectedCourses.includes(course.courseId) ? 'primary' : 'default'}
                    onClick={() => handleCourseToggle(course.courseId)}
                  />
                ))}
              </Box>

              <Box mt={3} textAlign="center">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setSearchString(searchQuery); // Gửi search query kèm type và course
                    toggleDrawer();
                  }}
                >
                  Apply Filters
                </Button>
              </Box>
            </Box>
          </Drawer> */}
          {drawerOpen && (
            <Box style={{ width: '100%', marginTop: 30 }}>
              <Box p={2}>
                <Typography variant="h6">Select Type</Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                  {documentTypes.map((type) => (
                    <Chip
                      key={type.documentTypeId}
                      label={type.typeName}
                      clickable
                      color={selectedTypes.includes(type.documentTypeId) ? 'primary' : 'default'}
                      onClick={() => handleTypeToggle(type.documentTypeId)}
                    />
                  ))}
                </Box>

                <Typography variant="h6" mt={2}>Select Courses</Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                  {courses.map((course) => (
                    <Chip
                      key={course.courseId}
                      label={course.courseName}
                      clickable
                      color={selectedCourses.includes(course.courseId) ? 'primary' : 'default'}
                      onClick={() => handleCourseToggle(course.courseId)}
                    />
                  ))}
                </Box>

                <Box mt={3} textAlign="center">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      handleSearchButton(searchQuery);
                    }}
                  >
                    Search
                  </Button>
                </Box>
              </Box>
            </Box>

          )}


          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
              <CircularProgress />
            </Box>
          ) : books.length > 0 ? (
            <>
              <Grid container spacing={2} justifyContent="flex-start" sx={{ marginTop: '60px' }}>
                {/* Map over books to display them in rows */}
                {books.map((book) => (
                  <Grid item key={book.documentId} justifyContent="center" xs={6} sm={4} md={3} lg={2}>
                    <BookCard
                      book={book}
                      onViewDocument={() => handleViewDocument(book.documentId.toString(), book.documentLink)}
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <Pagination
                  count={totalPages}
                  page={currentPage + 1}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            </>
          ) : (
            <Typography variant="h6" align="center" sx={{ marginTop: '20px' }}>
              Không tìm thấy dữ liệu.
            </Typography>
          )}
          {selectedBookId && (
            <BookDetail id={selectedBookId} open={!!selectedBookId} onClose={handleCloseDialog} />
          )}
        </Paper>
      </Box>
    </Box>
  );
}
