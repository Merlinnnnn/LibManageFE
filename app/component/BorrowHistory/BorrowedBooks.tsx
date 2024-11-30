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

const BorrowedBooks: React.FC = () => {
  const [books, setBooks] = useState<BorrowedBook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeOpen, setQrCodeOpen] = useState<boolean>(false);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);

  // Snackbar state
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const fetchBorrowedBooks = async () => {
    try {
      const response = await apiService.get('api/v1/loan-transactions/user/borrowed-books');
      setBooks((response.data as any).result.content);
      console.log(response)
    } catch (error) {
      setError("Đã xảy ra lỗi khi tải dữ liệu");
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
        backgroundColor: '#ffebee', // Light red background
        color: '#d32f2f',           // Dark red text
        border: '1px solid #d32f2f', // Red border
        borderRadius: '5px',
        padding: '4px 8px',
        display: 'inline-block',
        fontWeight: 'bold',
        textTransform: 'none',
      };
    } else if (status === 'PENDING') {
      return {
        backgroundColor: '#e3f2fd', // Light blue background
        color: '#1976d2',           // Blue text
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
      //console.error('Error fetching QR code:', error);
      showSnackbar('Có lỗi xảy ra khi mở qr code!', 'error');
    }
  };

  const handleQrCodeClick = (id: any) => {
    fetchQrCode(id);
  };
  const handleQrCodeClose = () => {
    setQrCodeOpen(false);
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
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
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
                        {book.status === 'RECEIVED' ? (
                          <Button variant="contained" color="secondary" onClick={() => handleReturn(book.transactionId)}>
                            Trả Sách
                          </Button>
                        ) : (
                          <Button variant="contained" color="primary" onClick={() => handleConfirm(book.transactionId)}>
                            Xác Nhận
                          </Button>
                        )}
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
                        <Tooltip title="Payment">
                          <IconButton
                            edge="end"
                            aria-label="Payment"
                            sx={{ color: 'black', padding: '15px'  }}
                          >
                            <PaymentIcon />
                          </IconButton>
                        </Tooltip>

                      </>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Dialog open={qrCodeOpen} onClose={handleQrCodeClose}>
            <DialogTitle>QR Code</DialogTitle>
            <DialogContent>
              {qrCodeImage && (
                <img src={qrCodeImage} alt="QR Code" style={{ width: '100%' }} />
              )}
            </DialogContent>
          </Dialog>
        </Grid>
      </Grid>

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
  );
};

export default BorrowedBooks;
