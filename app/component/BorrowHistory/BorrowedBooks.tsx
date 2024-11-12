import React, { useEffect, useState } from 'react';
import apiService from '../../untils/api';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, CircularProgress, Button, Box
} from '@mui/material';

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
      <TableContainer component={Paper} sx={{ maxWidth: 800, p: 2 }}>
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
                <TableCell>{book.status}</TableCell>
                <TableCell>
                  {book.status === 'RECEIVED' ? (
                    <Button variant="contained" color="secondary" onClick={() => handleReturn(book.transactionId)}>
                      Trả Sách
                    </Button>
                  ) : (
                    <Button variant="contained" color="primary" onClick={() => handleConfirm(book.transactionId)}>
                      Xác Nhận
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BorrowedBooks;
