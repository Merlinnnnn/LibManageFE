import React, { useState, useEffect } from 'react';
import { Grid, Box, Pagination, CircularProgress, Typography, Paper, TextField, InputAdornment, useTheme, Snackbar, Alert, IconButton } from '@mui/material';
import BookCard from './BookCard';
import apiService from '../../untils/api';
import Header from '../Home/Header';
import SearchIcon from '@mui/icons-material/Search';
import BookDetail from './BookDetail';  // Thêm BookDetail
import MenuIcon from '@mui/icons-material/Menu';

interface Book {
  documentId: number;
  documentName: string;
  cover?: string;
  author?: string;
  publisher?: string;
  isbn?: string;
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

export default function BookFavorite() {
  const [books, setBooks] = useState<Book[]>([]);
  const [displayedBooks, setDisplayedBooks] = useState<Book[]>([]); // Sách sau khi tìm kiếm
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>(''); // Chuỗi tìm kiếm
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null); // Trạng thái sách được chọn
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const booksPerPage = 20;
  const [searchString, setSearchString] = useState<string>('');
  const theme = useTheme();

  // Hàm hiển thị snackbar
  const showSnackbar = (severity: 'success' | 'error', message: string) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await apiService.get<BooksApiResponse>('/api/v1/documents/favorites', {
        params: {
          size: booksPerPage,
          page: currentPage,
        },
      });
      if (response.data && response.data.result) {
        setBooks(response.data.result.content);
        setTotalPages(response.data.result.totalPages);
        setDisplayedBooks(response.data.result.content); // Hiển thị tất cả sách ban đầu
      } else {
        setBooks([]);
        setTotalPages(1);
        setDisplayedBooks([]);
      }
    } catch (error) {
      console.log('Không thể tải sách:', error);
      setBooks([]);
      setDisplayedBooks([]);
      showSnackbar('error', 'Failed to load books.');
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách sách yêu thích
  useEffect(() => {
  
    fetchBooks();
  }, [currentPage]);

  // Xử lý tìm kiếm trong danh sách sách
  useEffect(() => {
    if (searchQuery === '') {
      setDisplayedBooks(books); // Nếu không có tìm kiếm, hiển thị tất cả sách
    } else {
      setDisplayedBooks(
        books.filter((book) =>
          book.documentName.toLowerCase().includes(searchQuery.toLowerCase()) // Lọc sách theo tên
        )
      );
    }
  }, [searchQuery, books]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value - 1);  // Cập nhật trang hiện tại
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Cập nhật chuỗi tìm kiếm
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      setSearchString(searchQuery); // Cập nhật searchString khi nhấn Enter
    }
  };

  const handleSearchIconClick = () => {
    setSearchString(searchQuery); // Cập nhật searchString khi nhấn vào biểu tượng tìm kiếm
  };

  const handleViewDocument = (id: string) => {
    setSelectedBookId(id); // Mở dialog khi click vào sách
  };

  const handleCloseDialog = () => {
    setSelectedBookId(null); // Đóng dialog
    fetchBooks
  };

  return (
    <Box suppressHydrationWarning sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box sx={{ padding: '20px', flexGrow: 1 }}>
        {/* Paper container for the book list */}
        <Paper sx={{ padding: '20px', position: 'relative', height:'100%' }}>
          {/* Thanh tìm kiếm */}
          {/* <IconButton  onClick={toggleDrawer}> */}
            <IconButton>
                      <MenuIcon />
                    </IconButton>
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
            <TextField
              variant="outlined"
              placeholder="Search books..."
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
                    <SearchIcon onClick={handleSearchIconClick} /> {/* Xử lý sự kiện khi click vào SearchIcon */}
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
              <CircularProgress />
            </Box>
          ) : displayedBooks.length > 0 ? (
            <>
              <Grid container spacing={2} justifyContent="flex-start" sx={{ marginTop: '60px' }}>
                {/* Map over books to display them in rows */}
                {displayedBooks.map((book) => (
                  <Grid item key={book.documentId} justifyContent="center" xs={6} sm={4} md={3} lg={2}>
                    <BookCard
                      book={book}
                      onViewDocument={() => handleViewDocument(book.documentId.toString())}  // Gọi handleViewDocument khi nhấn
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
        </Paper>
      </Box>

      {/* Hiển thị BookDetail khi có sách được chọn */}
      {selectedBookId && (
        <BookDetail id={selectedBookId} open={!!selectedBookId} onClose={handleCloseDialog} />
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{vertical: 'top', horizontal: 'right'}}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
