import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, IconButton,
  Tooltip, useTheme, useMediaQuery
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import apiService from '@/app/untils/api';
import { useRouter } from 'next/navigation';

interface Book {
  transactionId: string;
  documentName: string;
  loanDate: string;
  returnDate?: string;
  documentId?: string;
}

interface ApiResponse {
  data?: {
    content?: Book[];
  };
}

const HardBooksHistory = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHardBooks();
  }, []);

  const fetchHardBooks = async () => {
    setLoading(true);
    try {
      const infoRaw = localStorage.getItem('info');
      if (!infoRaw) throw new Error('Không tìm thấy thông tin người dùng');

      const userInfo = JSON.parse(infoRaw);
      const userId = userInfo.userId;

      const response = await apiService.get<ApiResponse>('/api/v1/loans/user/borrowed-books', {
        params: { userId },
      });

      const content = response.data.data?.content;
      if (!Array.isArray(content)) throw new Error('Dữ liệu trả về không hợp lệ');

      setBooks(content);
    } catch (error) {
      console.error(error);
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleReadBook = (id: string) => {
    router.push(`/readbook?id=${id}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  if (books.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography variant="h6" color="text.secondary">No hard books found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <TableContainer sx={{
        boxShadow: 'none',
        border: '1px solid #e0e0e0',
        borderRadius: '10px',
        overflow: 'hidden'
      }}>
        <Table sx={{
          minWidth: isMobile ? 600 : 800,
          tableLayout: 'fixed'
        }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              <TableCell sx={{
                fontWeight: 'bold',
                py: 2,
                width: '20%',
                px: 2
              }}>ID</TableCell>
              <TableCell sx={{
                fontWeight: 'bold',
                py: 2,
                width: '40%',
                px: 2
              }}>Book Title</TableCell>
              <TableCell sx={{
                fontWeight: 'bold',
                py: 2,
                width: '20%',
                px: 2
              }}>Loan Date</TableCell>
              <TableCell sx={{
                fontWeight: 'bold',
                py: 2,
                width: '20%',
                px: 2
              }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.map((book) => (
              <TableRow
                key={book.transactionId}
                sx={{
                  '&:hover': {
                    backgroundColor: '#f5f7f9',
                    cursor: 'pointer',
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s ease'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <TableCell sx={{
                  fontWeight: 'medium',
                  width: '20%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  px: 2
                }}>{book.transactionId}</TableCell>
                <TableCell sx={{
                  width: '40%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  px: 2
                }}>{book.documentName}</TableCell>
                <TableCell sx={{
                  width: '20%',
                  whiteSpace: 'nowrap',
                  px: 2
                }}>
                  {new Date(book.loanDate).toLocaleDateString()}
                </TableCell>
                <TableCell sx={{
                  width: '20%',
                  whiteSpace: 'nowrap',
                  px: 2
                }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Read Book">
                      <IconButton
                        edge="end"
                        aria-label="read"
                        onClick={() => handleReadBook(book.documentId as string)}
                        sx={{
                          color: 'primary.main',
                          padding: '8px',
                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.12)',
                          }
                        }}
                      >
                        <MenuBookIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HardBooksHistory; 