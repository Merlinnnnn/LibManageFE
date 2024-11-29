import React, { useEffect, useState } from 'react';
import apiService from '../../untils/api';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, CircularProgress, Button, Box, Grid,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';

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

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const fetchBorrowedBooks = async () => {
    try {
      const response = await apiService.get('api/v1/loan-transactions/user/borrowed-books');
      setBooks((response.data as any).result.content);
    } catch (error) {
      setError("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: number) => {
    console.log("ID của sách:", id);
    try {
      const response = await apiService.patch('/api/v1/loan-transactions', {
        transactionId: id,
        action: 'RECEIVE',
      });
      fetchBorrowedBooks();
      console.log(response);
    } catch (error) {
      console.error("Lỗi khi thực hiện hành động:", error);
    }
  };

  const handleReturn = async (id: number) => {
    console.log("Trả sách với ID:", id);
    try {
      const response = await apiService.patch('/api/v1/loan-transactions', {
        transactionId: id,
        action: 'RETURN_REQUEST',
      });
      fetchBorrowedBooks();
      console.log(response);
    } catch (error) {
      console.error("Lỗi khi thực hiện trả sách:", error);
    }
  };

  const getStatusStyle = (status: string) => {
    if (status === 'RECEIVED') {
      return {
        backgroundColor: '#e8f5e9', // Màu nền xanh lá nhạt
        color: '#388e3c', // Màu chữ xanh lá đậm
        border: '1px solid #388e3c', // Viền xanh lá đậm
        borderRadius: '5px',
        padding: '4px 8px',
        display: 'inline-block',
        fontWeight: 'bold',
        textTransform: 'none'
      };
    } else {
      return {
        backgroundColor: '#f5f5f5', // Màu nền xám nhạt
        color: '#757575', // Màu chữ xám
        border: '1px solid #bdbdbd', // Viền xám
        borderRadius: '5px',
        padding: '4px 8px',
        display: 'inline-block',
        fontWeight: 'bold',
        textTransform: 'none'
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
      console.error('Error fetching QR code:', error);
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
                    <TableCell>{book.returnDate || 'Chưa trả'}</TableCell>
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
                            onClick={() => handleQrCodeClick(book.transactionId)} // Bọc trong một hàm vô danh
                            sx={{ color: 'black' }}
                          >
                            <QrCodeIcon />
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
    </Box>
  );
};

export default BorrowedBooks;
