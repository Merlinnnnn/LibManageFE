import React, { useEffect, useState, useRef } from 'react';
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
  fineAmount?: number;
  paymentStatus?: string;
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

const SANDBOX_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

function buildVnpayUrl(params: Record<string, string | number>) {
  const query = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return `${SANDBOX_URL}?${query}`;
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
  const [vnpayParams, setVnpayParams] = useState<any | null>(null);
  const vnpayFormRef = useRef<HTMLFormElement>(null);
  const [payingId, setPayingId] = useState<number | null>(null);

  useEffect(() => {
    fetchHardBooks();
  }, []);

  useEffect(() => {
    if (vnpayParams && vnpayFormRef.current) {
      vnpayFormRef.current.submit();
      setVnpayParams(null); // reset sau khi submit
    }
  }, [vnpayParams]);

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
      case 'CANCELLED_AUTO':
        return 'Đã bị hủy tự động';
      default:
        return status;
    }
  };

  const getPaymentStatus = (status: string) => {
    switch (status) {
      case 'NON_PAYMENT':
        return { label: 'Không bị phạt', color: 'default' };
      case 'UNPAID':
        return { label: 'Chưa thanh toán', color: 'warning' };
      case 'PAID':
        return { label: 'Đã thanh toán', color: 'success' };
      default:
        return { label: status, color: 'default' };
    }
  };

  const handleVNPayPayment = async (book: Book) => {
    try {
      if (!book.transactionId) {
        alert('Không tìm thấy mã giao dịch!');
        return;
      }
      setPayingId(book.transactionId);
      setError(null);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8009/api/v1/vnpay/submitOrder/${book.transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data && data.redirectUrl) {
        window.open(data.redirectUrl, '_blank');
      } else {
        alert('Không thể tạo đơn thanh toán. Vui lòng thử lại sau.');
      }
    } catch (e) {
      console.error('Error:', e);
      alert('Không thể tạo link thanh toán VNPay!');
    } finally {
      setPayingId(null);
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
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Box sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0 // Important for text truncation to work
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold',
                mb: 1,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                height: '3.6em', // 2 lines of text
                lineHeight: '1.8em'
              }}>
                {book.documentName}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 1,
                  color: getStatusColor(book.status),
                  fontWeight: 'medium',
                  height: '1.5em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {getStatusText(book.status)}
              </Typography>
              <Typography variant="body2" sx={{ 
                mb: 1,
                height: '1.5em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                Ngày đặt: {new Date(book.loanDate).toLocaleDateString()}
              </Typography>
              {book.dueDate && (
                <Typography variant="body2" sx={{ 
                  mb: 1,
                  height: '1.5em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  Hạn trả: {new Date(book.dueDate).toLocaleDateString()}
                </Typography>
              )}
              {book.returnDate && (
                <Typography variant="body2" sx={{ 
                  mb: 2,
                  height: '1.5em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  Ngày trả: {new Date(book.returnDate).toLocaleDateString()}
                </Typography>
              )}
              {/* Thông tin phạt */}
              {typeof book.fineAmount === 'number' && book.fineAmount > 0 && (
                <Box sx={{ 
                  mb: 1,
                  minHeight: '3em' // Fixed height for fine information
                }}>
                  <Typography variant="body2" color="error" sx={{ 
                    fontWeight: 500,
                    height: '1.5em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    Tiền phạt: {book.fineAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ 
                      height: '1.5em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      Trạng thái phạt: 
                    </Typography>
                    <Box component="span" sx={{ 
                      display: 'inline-block',
                      verticalAlign: 'middle',
                      height: '1.5em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      <span style={{
                        color: book.paymentStatus === 'PAID' ? '#388e3c' : (book.paymentStatus === 'UNPAID' ? '#ed6c02' : '#888'),
                        fontWeight: 600
                      }}>
                        {getPaymentStatus(book.paymentStatus || '').label}
                      </span>
                    </Box>
                    {/* Nút thanh toán VNPay */}
                    {book.paymentStatus === 'UNPAID' && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ 
                          ml: 2, 
                          borderRadius: 2, 
                          textTransform: 'none',
                          flexShrink: 0 // Prevent button from shrinking
                        }}
                        onClick={() => handleVNPayPayment(book)}
                        disabled={payingId === book.transactionId}
                      >
                        {payingId === book.transactionId ? <CircularProgress size={18} color="inherit" /> : 'Thanh toán VNPay'}
                      </Button>
                    )}
                  </Box>
                </Box>
              )}
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                mt: 'auto', // Push buttons to bottom
                pt: 2 // Add some padding at top
              }}>
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
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          pt: 3,
          pb: 1
        }}>
          {selectedBook?.status === 'RESERVED' ? 'Mã QR nhận sách' : 'Mã QR trả sách'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 3,
            py: 3
          }}>
            {qrCodeUrl && (
              <Box
                sx={{
                  p: 2,
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
              >
                <Box
                  component="img"
                  src={qrCodeUrl}
                  alt="QR Code"
                  sx={{
                    width: 250,
                    height: 250,
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
              </Box>
            )}
            <Box sx={{ 
              textAlign: 'center',
              maxWidth: '400px',
              mx: 'auto'
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 1,
                  color: 'text.primary',
                  fontWeight: 'medium'
                }}
              >
                {selectedBook?.documentName}
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  lineHeight: 1.6,
                  mb: 2
                }}
              >
                {selectedBook?.status === 'RESERVED' 
                  ? 'Vui lòng mang mã QR này đến thư viện để nhận sách'
                  : 'Vui lòng mang mã QR này đến thư viện để trả sách'}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontStyle: 'italic',
                  opacity: 0.8
                }}
              >
                Mã QR này chỉ có hiệu lực một lần và sẽ hết hạn sau 24 giờ
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          px: 3, 
          pb: 3,
          justifyContent: 'center'
        }}>
          <Button 
            onClick={handleCloseQrDialog} 
            variant="contained"
            sx={{ 
              borderRadius: '8px',
              px: 4,
              py: 1,
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hidden VNPay Form */}
      <form
        ref={vnpayFormRef}
        method="POST"
        action={SANDBOX_URL}
        style={{ display: 'none' }}
      >
        {vnpayParams && Object.entries(vnpayParams).map(([key, value]) => (
          <input
            key={key}
            type="hidden"
            name={key}
            value={String(value)}
          />
        ))}
      </form>
    </Box>
  );
};

export default HardBooksHistory; 