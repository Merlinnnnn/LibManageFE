import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Input,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';
import Sidebar from '../SideBar';
import NewStudentsTable from './NewStudentsTable';
import RecentLoansTable from './RecentLoansTable';
import RecentSubscriptionsTable from './RecentSubscriptionsTable';
import apiService from '@/app/untils/api';
import QrCodeIcon from '@mui/icons-material/QrCode';
import BookIcon from '@mui/icons-material/Book';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

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
  const theme = useTheme();  // Lấy theme hiện tại từ useTheme

  const [tabIndex, setTabIndex] = useState(0);
  const [documentCount, setDocumentCount] = useState<number | null>(null);
  const [unpaidFinesCount, setUnpaidFinesCount] = useState<number | null>(null);
  const [borrowedDocCount, setBorrowedDocCount] = useState<number | null>(null);

  const [openDialog, setOpenDialog] = useState(false); // Trạng thái mở/đóng Dialog
  const [qrImage, setQrImage] = useState<File | null>(null); // Trạng thái lưu trữ ảnh QR

  // Snackbar state
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    fetchDocCount();
    fetchNewUserCount();
    fetchBorrowedDocCount();
  }, []);

  // Hàm thông báo lỗi và thành công
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
  };

  const handleQrImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setQrImage(file);
    }
  };
  const handleUploadQrImage = async () => {
    if (qrImage) {
      try {
        console.log('Đang tải ảnh lên...', qrImage);
        showNotification('success', 'Tải ảnh QR thành công!');
        handleCloseDialog();
      } catch (error: any) {
        console.error('Lỗi khi tải ảnh lên:', error);
        showNotification('error', error?.response?.data?.message || 'Có lỗi xảy ra khi tải ảnh');
      }
    } else {
      showNotification('error', 'Vui lòng chọn ảnh QR!');
    }
  };

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
          <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
            <Tab label="NEW STUDENTS" />
            <Tab label="RECENT LOANS" />
            <Tab label="RECENT SUBSCRIPTIONS" />
          </Tabs>
          <Box mt={2}>
            {tabIndex === 0 && <NewStudentsTable />}
            {tabIndex === 1 && <RecentLoansTable />}
            {tabIndex === 2 && <RecentSubscriptionsTable />}
          </Box>
        </Box>

        <IconButton onClick={handleOpenDialog} sx={{ position: 'absolute', bottom: 40, right: 40 }}>
          <QrCodeIcon />
        </IconButton>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Upload QR Code</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
              Please choose a QR image to upload:
            </Typography>
            <Input type="file" onChange={handleQrImageChange} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleUploadQrImage} color="primary">
              Upload
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* Snackbar thông báo */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoanManagerPage;
