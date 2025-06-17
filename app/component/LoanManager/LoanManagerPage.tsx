import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Paper,
  Container,
  Divider,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import Sidebar from '../SideBar';
import NewStudentsTable from './NewStudentsTable';
import RecentLoansTable from './RecentLoansTable';
import DigitalApproval from './DigitalApproval';
// import RecentSubscriptionsTable from './RecentSubscriptionsTable';
import AccessListTable from './AccessListTable';
import apiService from '@/app/untils/api';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ScanResponse {
  code: number;
  success: boolean;
  message: string;
  data?: {
    transactionId: number;
    documentId: string;
    physicalDocId: number;
    documentName: string;
    username: string;
    librarianId: string;
    loanDate: string;
    dueDate: string;
    returnDate: string;
    status: string;
    returnCondition: string;
    fineAmount: number;
    paymentStatus: string;
    paidAt: string | null;
  };
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const LoanManagerPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [value, setValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [bookInfoDialogOpen, setBookInfoDialogOpen] = useState(false);
  const [scannedBook, setScannedBook] = useState<ScanResponse['data'] | null>(null);
  const [damageChecked, setDamageChecked] = useState(false);
  const [fineLoading, setFineLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const infoString = localStorage.getItem('info');
    if (infoString) {
      try {
        const info = JSON.parse(infoString);
        if (info.roles && Array.isArray(info.roles)) {
          setIsAdmin(info.roles.includes('ADMIN'));
        }
      } catch (e) {
        setIsAdmin(false);
      }
    }
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setSnackbarSeverity(type);
    setSnackbarMessage(message);
    setOpenSnackbar(true);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
  };

  const handleScan = async (decodedText: string) => {
    try {
      const { data: responseData } = await apiService.get<ScanResponse>(`/api/v1/loans/scan?${decodedText}`);
      if (responseData.success && responseData.data) {
        setScannedBook(responseData.data);
        setBookInfoDialogOpen(true);
        setDamageChecked(false);
        handleCloseDialog();
        setRefreshTrigger(prev => prev + 1);
      } else {
        showNotification('error', responseData.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      showNotification('error', error?.response?.data?.message || 'Có lỗi xảy ra khi xử lý mã QR');
    }
  };

  const handleError = (error: string) => {
    console.error('Lỗi quét QR:', error);
    let errorMessage = 'Không thể quét mã QR. ';
    
    if (error.includes('NotFoundException')) {
      errorMessage += 'Vui lòng đảm bảo:\n' +
        '- Mã QR nằm trong khung hình\n' +
        '- Ánh sáng đủ và không bị chói\n' +
        '- Khoảng cách quét phù hợp (khoảng 20-30cm)\n' +
        '- Mã QR không bị mờ hoặc hỏng';
    }
    
    showNotification('error', errorMessage);
  };

  const handleCloseBookInfoDialog = () => {
    setBookInfoDialogOpen(false);
    setScannedBook(null);
    setDamageChecked(false);
  };

  const handleSendFine = async () => {
    if (!scannedBook) return;
    setFineLoading(true);
    try {
      await apiService.post(`/api/v1/loans/${scannedBook.transactionId}/fine`);
      showNotification('success', 'Đã gửi thông báo phạt thành công!');
      handleCloseBookInfoDialog();
    } catch (error: any) {
      showNotification('error', error?.response?.data?.message || 'Có lỗi khi gửi phạt');
    } finally {
      setFineLoading(false);
    }
  };

  useEffect(() => {
    if (openDialog) {
      setTimeout(() => {
        if (!scannerRef.current) {
          const scanner = new Html5QrcodeScanner(
            'qr-code-scanner',
            { 
              fps: 10, 
              qrbox: { width: 300, height: 300 },
              aspectRatio: 1.0,
              formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ],
              showTorchButtonIfSupported: true,
              showZoomSliderIfSupported: true,
              defaultZoomValueIfSupported: 2
            },
            false
          );
          scanner.render(handleScan, handleError);
          scannerRef.current = scanner;
        }
      }, 500);
    }
  }, [openDialog]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box display="flex" height="100vh" bgcolor="background.default">
      <Sidebar />
      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              color: theme.palette.text.primary,
              fontWeight: 600,
              mb: 3
            }}
          >
            Quản lý mượn trả sách
          </Typography>

          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Tabs 
              value={value} 
              onChange={handleChange} 
              aria-label="loan management tabs"
              variant={isMobile ? "fullWidth" : "standard"}
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  minWidth: 120,
                  px: 3,
                  py: 2
                }
              }}
            >
              <Tab label="Quản lý mượn sách" {...a11yProps(0)} />
              <Tab label="Quản lý yêu cầu đăng sách" {...a11yProps(1)} />
              {isAdmin && <Tab label="Quản lý người dùng" {...a11yProps(2)} />}
              <Tab label="Quản lý yêu cầu truy cập" {...a11yProps(isAdmin ? 3 : 2)} />
            </Tabs>

            <TabPanel value={value} index={0}>
              <RecentLoansTable onScanQR={handleOpenDialog} refreshTrigger={refreshTrigger} />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <DigitalApproval />
            </TabPanel>
            {isAdmin && (
              <TabPanel value={value} index={2}>
                <NewStudentsTable />
              </TabPanel>
            )}
            <TabPanel value={value} index={isAdmin ? 3 : 2}>
              <AccessListTable />
            </TabPanel>
          </Paper>
        </Box>

        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: 'primary.main',
            color: 'white',
            py: 2
          }}>
            Quét mã QR
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}>
              <div id="qr-code-scanner" style={{ width: '100%', height: '300px' }} />
              <Typography variant="body2" color="text.secondary" align="center">
                Đặt mã QR vào khung hình để quét và xác nhận giao dịch
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button 
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{ 
                borderRadius: 1,
                px: 3
              }}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={bookInfoDialogOpen}
          onClose={handleCloseBookInfoDialog}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 600 }}>Thông tin giao dịch</DialogTitle>
          <DialogContent dividers>
            {scannedBook && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography><b>Tên sách:</b> {scannedBook.documentName}</Typography>
                <Typography><b>Người mượn:</b> {scannedBook.username}</Typography>
                <Typography><b>Ngày mượn:</b> {new Date(scannedBook.loanDate).toLocaleDateString()}</Typography>
                <Typography><b>Hạn trả:</b> {scannedBook.dueDate ? new Date(scannedBook.dueDate).toLocaleDateString() : '-'}</Typography>
                <Typography><b>Trạng thái:</b> {scannedBook.status}</Typography>
                <Typography><b>Tiền phạt:</b> {scannedBook.fineAmount ? scannedBook.fineAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '-'}</Typography>
                <Typography><b>Thanh toán:</b> {scannedBook.paymentStatus === 'NON_PAYMENT' ? 'Chưa thanh toán' : 'Đã thanh toán'}</Typography>
                {scannedBook.status === 'RETURNED' && (
                  <FormControlLabel
                    control={<Checkbox checked={damageChecked} onChange={e => setDamageChecked(e.target.checked)} />}
                    label="Sách bị hư hỏng"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            {scannedBook && scannedBook.status === 'RETURNED' ? (
              <Button
                onClick={handleSendFine}
                variant="contained"
                color="error"
                disabled={!damageChecked || fineLoading}
              >
                {fineLoading ? 'Đang gửi...' : 'Gửi phạt'}
              </Button>
            ) : null}
            <Button onClick={handleCloseBookInfoDialog} variant="outlined">Đóng</Button>
          </DialogActions>
        </Dialog>

        <Snackbar 
          open={openSnackbar} 
          autoHideDuration={6000} 
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setOpenSnackbar(false)} 
            severity={snackbarSeverity}
            variant="filled"
            sx={{ 
              borderRadius: 1,
              boxShadow: theme.shadows[2]
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default LoanManagerPage;
