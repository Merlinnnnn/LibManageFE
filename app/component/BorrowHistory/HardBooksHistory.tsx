import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Button,
  useTheme, useMediaQuery, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import QrCodeIcon from '@mui/icons-material/QrCode';
import apiService from '@/app/untils/api';
import { useRouter } from 'next/navigation';

interface Book {
  transactionId: number;
  documentId: string;
  physicalDocId: number;
  documentName: string;
  username: string;
  librarianId: string | null;
  loanDate: string;
  dueDate: string | null;
  returnDate: string | null;
  status: string;
  returnCondition: string | null;
}

interface ApiResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    content: Book[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
    sortDetails: Array<{
      property: string;
      direction: string;
    }>;
  };
}

const HardBooksHistory = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showQrDialog, setShowQrDialog] = useState(false);

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

      if (!response.data.success) {
        throw new Error(response.data.message || 'Có lỗi xảy ra khi tải dữ liệu');
      }

      const content = response.data.data.content;
      if (!Array.isArray(content)) {
        throw new Error('Dữ liệu trả về không hợp lệ');
      }

      setBooks(content);
    } catch (error) {
      console.error(error);
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleShowQrCode = async (book: Book) => {
    try {
      const response = await apiService.get(`/api/v1/loans/${book.transactionId}/qrcode-image`, {
        responseType: 'blob'
      });
      
      const imageUrl = URL.createObjectURL(response.data as Blob);
      setQrCodeUrl(imageUrl);
      setSelectedBook(book);
      setShowQrDialog(true);
    } catch (error) {
      console.error('Error fetching QR code:', error);
      setError('Không thể tải mã QR');
    }
  };

  const handleCloseQrDialog = () => {
    setShowQrDialog(false);
    setQrCodeUrl('');
    setSelectedBook(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESERVED':
        return 'warning.main';
      case 'BORROWED':
        return 'info.main';
      case 'RETURNED':
        return 'success.main';
      default:
        return 'text.secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'RESERVED':
        return 'Đang chờ nhận sách';
      case 'BORROWED':
        return 'Đang mượn';
      case 'RETURNED':
        return 'Đã trả';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  if (books.length === 0) {
    return (
      <Box sx={{ 
        p: 4, 
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: '12px'
      }}>
        <Typography variant="h6" color="text.secondary">
          Chưa có sách nào được mượn
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ 
        display: 'grid', 
        gap: 2,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)'
        }
      }}>
        {books.map((book) => (
          <Paper
            key={book.transactionId}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '12px',
              backgroundColor: 'rgba(0,0,0,0.02)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold',
                mb: 1,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {book.documentName}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 1,
                  color: getStatusColor(book.status),
                  fontWeight: 'medium'
                }}
              >
                {getStatusText(book.status)}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Ngày đặt: {new Date(book.loanDate).toLocaleDateString()}
              </Typography>
              {book.dueDate && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Hạn trả: {new Date(book.dueDate).toLocaleDateString()}
                </Typography>
              )}
              {book.returnDate && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Ngày trả: {new Date(book.returnDate).toLocaleDateString()}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {book.status === 'RESERVED' && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleShowQrCode(book)}
                    startIcon={<QrCodeIcon />}
                    sx={{ 
                      borderRadius: '8px',
                      textTransform: 'none'
                    }}
                  >
                    Hiển thị mã QR
                  </Button>
                )}
                {book.status === 'BORROWED' && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleShowQrCode(book)}
                    startIcon={<AssignmentReturnIcon />}
                    sx={{ 
                      borderRadius: '8px',
                      textTransform: 'none'
                    }}
                  >
                    Trả sách
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* QR Code Dialog */}
      <Dialog 
        open={showQrDialog} 
        onClose={handleCloseQrDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedBook?.status === 'RESERVED' ? 'Mã QR nhận sách' : 'Mã QR trả sách'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 2,
            py: 2
          }}>
            {qrCodeUrl && (
              <Box
                component="img"
                src={qrCodeUrl}
                alt="QR Code"
                sx={{
                  width: 200,
                  height: 200,
                  objectFit: 'contain'
                }}
              />
            )}
            <Typography variant="body2" color="text.secondary" align="center">
              {selectedBook?.status === 'RESERVED' 
                ? 'Vui lòng mang mã QR này đến thư viện để nhận sách'
                : 'Vui lòng mang mã QR này đến thư viện để trả sách'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQrDialog} sx={{ borderRadius: '8px' }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HardBooksHistory; 