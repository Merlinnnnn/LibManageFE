import React, { useEffect, useState } from 'react';
import { 
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  TablePagination, Box, Snackbar, Alert 
} from '@mui/material';
import apiService from '@/app/untils/api';

interface Fine {
  fineId: number;
  username: string;
  amount: number;
  dueDate: string;
  status: string;
}

const FineTable: React.FC = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Fetch fines from API
  const fetchFines = async () => {
    try {
      const response = await apiService.get<{ data: { content: Fine[] } }>('/api/v1/fines');
      setFines(response.data.data.content);
    } catch (error) {
      console.log('Lỗi khi lấy dữ liệu phạt:', error);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box>
      <TableContainer component={Paper} style={{ maxHeight: '300px', overflow: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell style={{ padding: '4px 8px' }}>ID</TableCell>
              <TableCell style={{ padding: '4px 8px' }}>Amount</TableCell>
              <TableCell style={{ padding: '4px 8px' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fines.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((fine) => (
              <TableRow key={fine.fineId}>
                <TableCell style={{ padding: '4px 8px' }}>{fine.fineId}</TableCell>
                <TableCell style={{ padding: '4px 8px' }}>{fine.amount}</TableCell>
                <TableCell style={{ padding: '4px 8px' }}>{fine.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        component="div"
        count={fines.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FineTable;
