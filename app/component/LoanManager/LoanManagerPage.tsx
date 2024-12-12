import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';
import Sidebar from '../SideBar';
import NewStudentsTable from './NewStudentsTable';
import RecentLoansTable from './RecentLoansTable';
import FineTable from './FineManagerTable';
import RecentSubscriptionsTable from './RecentSubscriptionsTable';
import apiService from '@/app/untils/api';
import QrCodeIcon from '@mui/icons-material/QrCode';
import BookIcon from '@mui/icons-material/Book';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

// Import html5-qrcode
import { Html5QrcodeScanner } from 'html5-qrcode';

interface DocumentCountResponse {
  result: {
    documentCount: number;
  };
}

interface FinesUnpaidCountResponse {
  result: number;
}

interface UnreturnedDocumentsCountResponse {
  result: number;
}

const LoanManagerPage: React.FC = () => {
  const theme = useTheme();
  const [tabIndex, setTabIndex] = useState(0);
  const [documentCount, setDocumentCount] = useState<number | null>(null);
  const [unpaidFinesCount, setUnpaidFinesCount] = useState<number | null>(null);
  const [borrowedDocCount, setBorrowedDocCount] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false); // Để mở Dialog QR Scanner
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    fetchDocCount();
    fetchNewUserCount();
    fetchBorrowedDocCount();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setSnackbarSeverity(type);
    setSnackbarMessage(message);
    setOpenSnackbar(true);
  };

  const fetchDocCount = async () => {
    try {
      const response = await apiService.get<DocumentCountResponse>('/api/v1/dashboards/documents/count');
      setDocumentCount(response.data.result.documentCount);
    } catch (error: any) {
      showNotification('error', error?.response?.data?.message || 'Có lỗi xảy ra khi lấy số lượng sách');
    }
  };

  const fetchNewUserCount = async () => {
    try {
      const response = await apiService.get<FinesUnpaidCountResponse>('/api/v1/dashboards/fines/unpaid/count');
      setUnpaidFinesCount(response.data.result);
    } catch (error: any) {
      showNotification('error', error?.response?.data?.message || 'Có lỗi xảy ra khi lấy khoản phạt');
    }
  };

  const fetchBorrowedDocCount = async () => {
    try {
      const response = await apiService.get<UnreturnedDocumentsCountResponse>('/api/v1/dashboards/documents/unreturned/count');
      setBorrowedDocCount(response.data.result);
    } catch (error: any) {
      showNotification('error', error?.response?.data?.message || 'Có lỗi xảy ra khi lấy số lượng sách đang mượn');
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    if (scannerRef.current) {
      scannerRef.current.clear(); // Dừng quét QR khi đóng Dialog
    }
  };

  const handleScan = async (decodedText: string, decodedResult: any) => {
    //console.log('QR Code data:', decodedText);
    showNotification('success', `Quét mã thành công: ${decodedText}`);
    const data = {
      barcodeData: decodedText
    }
    
    try {
      const response = await apiService.post('/api/v1/loan-transactions/scan-qrcode', data);
      console.log(response)
      //setBorrowedDocCount(response.data.result);
      handleCloseDialog();
    } catch (error: any) {
      showNotification('error', error?.response?.data?.message || 'Có lỗi xảy ra khi lấy số lượng sách đang mượn');
    }
  };

  const handleError = (error: string) => {
    console.log('Lỗi quét QR:', error);
    showNotification('error', 'Không thể quét mã QR');
  };

  useEffect(() => {
    if (openDialog) {
      // Đảm bảo phần tử "qr-code-scanner" đã có trong DOM khi khởi tạo scanner
      setTimeout(() => {
        if (!scannerRef.current) {
          // Tạo mới Html5QrcodeScanner nếu chưa có
          const scanner = new Html5QrcodeScanner(
            'qr-code-scanner',
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
          );
          scanner.render(handleScan, handleError);
          scannerRef.current = scanner;
        }
      }, 500); // Đợi một chút để phần tử được render
    } else if (scannerRef.current) {
      // Clear khi đóng dialog
      scannerRef.current.clear();
      scannerRef.current = null;
    }
  }, [openDialog]);
  
  return (
    <Box display="flex" height="100vh">
      <Sidebar />
      <Box flex={1} p={3} overflow="auto" height="100vh">
        <Typography variant="h4" gutterBottom sx={{ color: theme.palette.text.primary }}>
          Dashboard
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <Card
              sx={{
                padding: 2,
                textAlign: 'center',
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
              }}
            >
              <Typography variant="subtitle1">TOTAL BOOKS</Typography>
              <Typography variant="h4">
                {documentCount !== null ? documentCount : 'Loading...'}
              </Typography>
              <IconButton sx={{ color: theme.palette.primary.main, marginTop: 1 }}>
                <BookIcon fontSize="large" />
              </IconButton>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card
              sx={{
                padding: 2,
                textAlign: 'center',
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
              }}
            >
              <Typography variant="subtitle1">BORROWED BOOKS</Typography>
              <Typography variant="h4">
                {borrowedDocCount !== null ? borrowedDocCount : 'Loading...'}
              </Typography>
              <IconButton sx={{ color: theme.palette.primary.main, marginTop: 1 }}>
                <SwapHorizIcon fontSize="large" />
              </IconButton>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card
              sx={{
                padding: 2,
                textAlign: 'center',
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
              }}
            >
              <Typography variant="subtitle1">UNPAID</Typography>
              <Typography variant="h4">
                {unpaidFinesCount !== null ? unpaidFinesCount : 'Loading...'}
              </Typography>
              <IconButton sx={{ color: theme.palette.primary.main, marginTop: 1 }}>
                <MoneyOffIcon fontSize="large" />
              </IconButton>
            </Card>
          </Grid>
        </Grid>

        <Box mt={4}>
          <Tabs value={tabIndex} onChange={(event, newValue) => setTabIndex(newValue)} indicatorColor="primary" textColor="primary">
            <Tab label="NEW STUDENTS" />
            <Tab label="RECENT LOANS" />
            <Tab label="RETURN REQUEST" />
            <Tab label="FINES" />
          </Tabs>
          <Box mt={2}>
            {tabIndex === 0 && <NewStudentsTable />}
            {tabIndex === 1 && <RecentLoansTable />}
            {tabIndex === 2 && <RecentSubscriptionsTable />}
            {tabIndex === 3 && <FineTable />}
          </Box>
        </Box>

        <IconButton onClick={handleOpenDialog} sx={{ position: 'absolute', bottom: 40, right: 40 }}>
          <QrCodeIcon />
        </IconButton>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>QR Code Scanner</DialogTitle>
          <DialogContent>
            <div id="qr-code-scanner" style={{ width: '100%', height: '250px' }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
          <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default LoanManagerPage;
