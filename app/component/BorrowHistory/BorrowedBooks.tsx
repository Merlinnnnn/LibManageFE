import React, { useEffect, useState } from 'react';
import apiService from '../../untils/api';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, CircularProgress, Button, Box, Grid,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent, Snackbar, Alert
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import PaymentIcon from '@mui/icons-material/Payment';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import PaidIcon from '@mui/icons-material/Paid';
import Header from '../Home/Header';

interface BorrowedBook {
  transactionId: number;
  documentName: string;
  loanDate: string;
  dueDate: string | null;
  returnDate: string | null;
  originalRackId: string | null;
  originalWarehouseId: string | null;
  status: string;
}
interface VnPayResponse {
  message: string;
  code: number;
  result: {
    vnpayUrl: string;
  };
}

const BorrowedBooks: React.FC = () => {
  const [books, setBooks] = useState<BorrowedBook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeOpen, setQrCodeOpen] = useState<boolean>(false);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);

  // Dialog payment options
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);

  // Snackbar state
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const fetchBorrowedBooks = async () => {
    try {
      const infoRaw = localStorage.getItem('info');
      if (!infoRaw) throw new Error('Không tìm thấy thông tin người dùng');
  
      const userInfo = JSON.parse(infoRaw);
      const userId = userInfo.userId;
  
      // Gọi API có gắn đúng userId
      const response = await apiService.get(`/api/v1/loans/user/borrowed-books`, {
        params: {
          userId,
          page: 0,
          size: 10,
        },
      });
  
      const content = response?.data?.data?.content;
      setBooks(Array.isArray(content) ? content : []);
      console.log('📚 Borrowed books:', content);
    } catch (error) {
      console.error('❌ Error fetching borrowed books:', error);
      setError('Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };
  

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);

    setTimeout(() => {
      setOpenSnackbar(false);
    }, 3000); // Tắt sau 3 giây
  };

  const handleConfirm = async (id: number) => {
    try {
      const response = await apiService.patch('/api/v1/loan-transactions', {
        transactionId: id,
        action: 'RECEIVE',
      });
      fetchBorrowedBooks();
      showSnackbar('Xác nhận thành công!', 'success');
    } catch (error) {
      showSnackbar('Có lỗi xảy ra khi xác nhận!', 'error');
    }
  };

  const handleReturn = async (id: number) => {
    try {
      const response = await apiService.patch('/api/v1/loan-transactions', {
        transactionId: id,
        action: 'RETURN_REQUEST',
      });
      fetchBorrowedBooks();
      showSnackbar('Yêu cầu trả sách thành công!', 'success');
    } catch (error) {
      showSnackbar('Có lỗi xảy ra khi yêu cầu trả sách!', 'error');
    }
  };

  const getStatusStyle = (status: string) => {
    if (status === 'RECEIVED') {
      return {
        backgroundColor: '#e8f5e9',
        color: '#388e3c',
        border: '1px solid #388e3c',
        borderRadius: '5px',
        padding: '4px 8px',
        display: 'inline-block',
        fontWeight: 'bold',
        textTransform: 'none',
      };
    } else if (status === 'REJECTED') {
      return {
        backgroundColor: '#ffebee',
        color: '#d32f2f',
        border: '1px solid #d32f2f',
        borderRadius: '5px',
        padding: '4px 8px',
        display: 'inline-block',
        fontWeight: 'bold',
        textTransform: 'none',
      };
    } else if (status === 'PENDING') {
      return {
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
        border: '1px solid #1976d2',
        borderRadius: '5px',
        padding: '4px 8px',
        display: 'inline-block',
        fontWeight: 'bold',
        textTransform: 'none',
      };
    } else {
      return {
        backgroundColor: '#f5f5f5',
        color: '#757575',
        border: '1px solid #bdbdbd',
        borderRadius: '5px',
        padding: '4px 8px',
        display: 'inline-block',
        fontWeight: 'bold',
        textTransform: 'none',
      };
    }
  };

  const fetchQrCode = async (id: any) => {
    try {
      const response = await apiService.get(`/api/v1/loan-transactions/${id}/qrcode-image`, {
        responseType: 'blob',
      });

      const qrCodeUrl = URL.createObjectURL(response.data as Blob);
      setQrCodeImage(qrCodeUrl);
      setQrCodeOpen(true);
    } catch (error) {
      showSnackbar('Có lỗi xảy ra khi mở qr code!', 'error');
    }
  };

  const handleQrCodeClick = (id: any) => {
    fetchQrCode(id);
  };

  const handleQrCodeClose = () => {
    setQrCodeOpen(false);
  };

  const handlePaymentDialogClose = () => {
    setPaymentDialogOpen(false);
    setSelectedTransactionId(null);
  };

  interface VnPayResponse {
    result: {
      vnpayUrl: string; // URL thanh toán mà VNPAY trả về
    };
    message: string; // Thông điệp trả về từ VNPAY, có thể là "success" hay lỗi
    code: number; // Mã trạng thái của giao dịch, có thể là 00 thành công, các mã khác là lỗi
  }

  const handlePaymentMethodSelect = async (method: 'online' | 'cash') => {
    if (selectedTransactionId && method === 'online') {
      try {
        const response = await apiService.post<VnPayResponse>(`/api/v1/vnpay/submitOrder/${selectedTransactionId}`);

        if (response.data && response.data.result && response.data.result.vnpayUrl) {
          const redirectUrl = response.data.result.vnpayUrl;

          window.open(redirectUrl);

          showSnackbar('Thanh toán online thành công!', 'success');
        } else {
          console.log('Không có URL thanh toán hợp lệ');
          showSnackbar('Có lỗi xảy ra khi nhận URL thanh toán.', 'error');
        }
      } catch (error) {
        console.log('Lỗi trong quá trình thanh toán:', error);
        showSnackbar('Có lỗi xảy ra khi thanh toán online!', 'error');
      }
    }

    handlePaymentDialogClose();
  };


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (books.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Không có dữ liệu</Typography>
      </Box>
    );
  }

  return (
    <Box >
      <Header />
      <Box display="flex" justifyContent="center" alignItems="center" marginTop={'60px'}>

        <Grid container justifyContent="center">
          <Grid item xs={12} sm={10} md={8} lg={8}>
            <TableContainer component={Paper} sx={{ maxWidth: '100%', p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Danh sách các sách đang mượn của người dùng
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mã Giao Dịch</TableCell>
                    <TableCell>Tên Sách</TableCell>
                    <TableCell>Ngày Mượn</TableCell>
                    <TableCell>Ngày Trả</TableCell>
                    <TableCell>Trạng Thái</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.transactionId}>
                      <TableCell>{book.transactionId}</TableCell>
                      <TableCell>{book.documentName}</TableCell>
                      <TableCell>{book.loanDate}</TableCell>
                      <TableCell>{book.returnDate || 'Chưa có'}</TableCell>
                      <TableCell>
                        <Box sx={getStatusStyle(book.status)}>
                          {book.status}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <>
                          {/* {book.status === 'RECEIVED' ? (
                            <Button variant="contained" color="secondary" onClick={() => handleReturn(book.transactionId)}>
                              Trả Sách
                            </Button>
                          ) : (
                            <Button variant="contained" color="primary" onClick={() => handleConfirm(book.transactionId)}>
                              Xác Nhận
                            </Button>
                          )} */}
                          {book.status === 'RECEIVED' || book.status === 'APPROVED' ? (
                            <Tooltip title="QR Code">
                              <IconButton
                                edge="end"
                                aria-label="qr code"
                                onClick={() => handleQrCodeClick(book.transactionId)}
                                sx={{ color: 'black', padding: '15px' }}
                              >
                                <QrCodeIcon />
                              </IconButton>
                            </Tooltip>
                          ) : null}

                          {book.status === 'RETURNED' ? (
                            <Tooltip title="Payment">
                              <IconButton
                                edge="end"
                                aria-label="Payment"
                                onClick={() => {
                                  setPaymentDialogOpen(true);
                                  setSelectedTransactionId(book.transactionId);
                                }}
                                sx={{ color: 'black', padding: '15px' }}
                              >
                                <PaymentIcon />
                              </IconButton>
                            </Tooltip>
                          ) : null}
                          {/* <Tooltip title="QR Code">
                            <IconButton
                              edge="end"
                              aria-label="qr code"
                              onClick={() => handleQrCodeClick(book.transactionId)}
                              sx={{ color: 'black', padding: '15px' }}
                            >
                              <QrCodeIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Payment">
                            <IconButton
                              edge="end"
                              aria-label="Payment"
                              onClick={() => {
                                setPaymentDialogOpen(true);
                                setSelectedTransactionId(book.transactionId);
                              }}
                              sx={{ color: 'black', padding: '15px' }}
                            >
                              <PaymentIcon />
                            </IconButton>
                          </Tooltip> */}
                        </>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>

        {/* Payment Dialog */}
        <Dialog open={paymentDialogOpen} onClose={handlePaymentDialogClose}>
          <DialogTitle>Chọn phương thức thanh toán</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} justifyContent="center">
              {/* Nút Tiền mặt */}
              <Grid item xs={6} display="flex" justifyContent="center">
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handlePaymentMethodSelect('cash')}
                  sx={{
                    width: 300,
                    height: 300,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 2, // Border radius để tạo góc bo tròn
                    padding: 2,
                  }}
                >
                  <PaidIcon sx={{ fontSize: 80 }} />
                  <Typography variant="h6" sx={{ marginTop: 2 }}>Tiền mặt</Typography>
                </Button>
              </Grid>

              {/* Nút Chuyển khoản Online */}
              <Grid item xs={6} display="flex" justifyContent="center">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handlePaymentMethodSelect('online')}
                  sx={{
                    width: 300,
                    height: 300,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 2,
                    padding: 2,
                  }}
                >
                  <CreditScoreIcon sx={{ fontSize: 80 }} />
                  <Typography variant="h6" sx={{ marginTop: 2 }}>Chuyển khoản Online</Typography>
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
        <Dialog open={qrCodeOpen} onClose={handleQrCodeClose}>
          <DialogTitle>QR Code</DialogTitle>
          <DialogContent sx={{ alignItems: 'center' }}>
            {qrCodeImage && (
              <img src={qrCodeImage} alt="QR Code" style={{ width: '95%' }} />
            )}
          </DialogContent>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default BorrowedBooks;
