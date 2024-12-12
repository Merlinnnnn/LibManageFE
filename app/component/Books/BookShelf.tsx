import React, { useState, useEffect } from 'react';
import { Grid, Box, Pagination, CircularProgress, Typography, Paper, TextField, InputAdornment, useTheme } from '@mui/material';
import BookCard from './BookCard';
import apiService from '../../untils/api';
import Header from '../Home/Header';
import BookDetail from './BookDetail';
import SearchIcon from '@mui/icons-material/Search';

interface Book {
  documentId: number;
  documentName: string;
  cover?: string;
  author?: string;
  publisher?: string;
  isbn?: string;
  documentLink: string;
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

export default function BookShelf() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');  // searchQuery để thao tác với API
  const [searchString, setSearchString] = useState<string>(''); // searchString để theo dõi chuỗi tìm kiếm
  const booksPerPage = 20;
  const theme = useTheme();

  // Fetch books when page changes or search query changes
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const response = await apiService.get<BooksApiResponse>('/api/v1/documents/search', {
          params: {
            documentName: searchString,  // Gửi search string dưới dạng param
            size: booksPerPage,
            page: currentPage,
          },
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

  const handleSearchIconClick = () => {
    setSearchString(searchQuery); // Cập nhật searchString khi nhấn vào biểu tượng tìm kiếm
  };

  const handleCloseDialog = () => {
    setSelectedBookId(null);
  };

  return (
    <Box>
      <Header />
      <Box sx={{ padding: '20px' }}>
        {/* Paper container for the book list */}
        <Paper sx={{ padding: '20px', position: 'relative' }}>
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
