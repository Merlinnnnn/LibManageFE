import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Button,
  useTheme, useMediaQuery
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import apiService from '@/app/untils/api';
import { useRouter } from 'next/navigation';

interface AccessRequest {
  id: number;
  uploadId: number;
  requesterId: string;
  ownerId: string;
  reviewerId: string | null;
  requestTime: string;
  decisionTime: string | null;
  licenseExpiry: string | null;
  status: string;
  fileType?: string;
}

interface ApiResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    content: AccessRequest[];
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

const SoftBooksHistory = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();

  const [books, setBooks] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSoftBooks();
  }, []);

  const fetchSoftBooks = async () => {
    setLoading(true);
    try {
      const infoRaw = localStorage.getItem('info');
      if (!infoRaw) throw new Error('Không tìm thấy thông tin người dùng');

      const userInfo = JSON.parse(infoRaw);
      const userId = userInfo.userId;

      const response = await apiService.get<ApiResponse>('/api/v1/access-requests/user', {
        params: { userId },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Có lỗi xảy ra khi tải dữ liệu');
      }

      const content = response.data.data.content;
      if (!Array.isArray(content)) {
        throw new Error('Dữ liệu trả về không hợp lệ');
      }

      // Nếu API không trả về fileType, có thể cần fetch thêm hoặc đoán loại file ở đây
      setBooks(content);
    } catch (error) {
      console.error(error);
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleRead = (book: AccessRequest) => {
    if (book.fileType?.includes('word')) {
      router.push(`/readword?id=${book.uploadId}`);
    } else {
      router.push(`/readpdf?id=${book.uploadId}`);
    }
  };

  const handleReturn = (book: AccessRequest) => {
    // Implement return logic here
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
          Chưa có sách điện tử nào được mượn
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
            key={book.id}
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
                Mã sách: {book.uploadId}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Trạng thái: {book.status === 'APPROVED' ? 'Đã duyệt' : 
                           book.status === 'PENDING' ? 'Đang chờ duyệt' : 
                           book.status === 'REJECTED' ? 'Từ chối' : book.status}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Ngày yêu cầu: {new Date(book.requestTime).toLocaleDateString()}
              </Typography>
              {book.decisionTime && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Ngày duyệt: {new Date(book.decisionTime).toLocaleDateString()}
                </Typography>
              )}
              {book.licenseExpiry && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Ngày hết hạn: {new Date(book.licenseExpiry).toLocaleDateString()}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {book.status === 'APPROVED' && (
                  <>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => router.push(`/readpdf?id=${book.uploadId}`)}
                      startIcon={<MenuBookIcon />}
                      sx={{ 
                        borderRadius: '8px',
                        textTransform: 'none'
                      }}
                    >
                      Đọc PDF
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      color="secondary"
                      onClick={() => router.push(`/readword?id=${book.uploadId}`)}
                      startIcon={<MenuBookIcon />}
                      sx={{ 
                        borderRadius: '8px',
                        textTransform: 'none'
                      }}
                    >
                      Đọc Word
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleReturn(book)}
                      startIcon={<AssignmentReturnIcon />}
                      sx={{ 
                        borderRadius: '8px',
                        textTransform: 'none'
                      }}
                    >
                      Trả
                    </Button>
                  </>
                )}
                {book.status === 'PENDING' && (
                  <Typography variant="body2" color="warning.main">
                    Đang chờ duyệt
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default SoftBooksHistory; 