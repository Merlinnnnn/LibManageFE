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
  Divider
} from '@mui/material';
import Sidebar from '../SideBar';
import NewStudentsTable from './NewStudentsTable';
import RecentLoansTable from './RecentLoansTable';
import FineManagerTable from './FineManagerTable';
import RecentSubscriptionsTable from './RecentSubscriptionsTable';
import apiService from '@/app/untils/api';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ScanResponse {
  success: boolean;
  message: string;
  data?: any;
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
  const [scanningMode, setScanningMode] = useState<'reserved' | 'return'>('reserved');
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setSnackbarSeverity(type);
    setSnackbarMessage(message);
    setOpenSnackbar(true);
  };

  const handleOpenDialog = (mode: 'reserved' | 'return', loanId: number) => {
    setScanningMode(mode);
    setSelectedLoanId(loanId);
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
    if (!selectedLoanId) return;

    try {
      const response = await apiService.get<ScanResponse>(`/api/v1/loans/scan?${decodedText}`);
      console.log(decodedText);
      console.log(response);

      if (response.data.success) {
        showNotification('success', response.data.message || `Xác nhận ${scanningMode === 'reserved' ? 'nhận' : 'trả'} sách thành công`);
        handleCloseDialog();
        // Refresh the loans list
        if (value === 0) {
          const loansTable = document.querySelector('#recent-loans-table');
          if (loansTable) {
            (loansTable as any).fetchLoans();
          }
        }
      } else {
        showNotification('error', response.data.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      console.error('Error scanning QR:', error);
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
              <Tab label="Quản lý phạt" {...a11yProps(1)} />
              <Tab label="Quản lý đăng ký" {...a11yProps(2)} />
              <Tab label="Sinh viên mới" {...a11yProps(3)} />
            </Tabs>

            <TabPanel value={value} index={0}>
              <RecentLoansTable onScanQR={handleOpenDialog} />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <FineManagerTable />
            </TabPanel>
            <TabPanel value={value} index={2}>
              <RecentSubscriptionsTable />
            </TabPanel>
            <TabPanel value={value} index={3}>
              <NewStudentsTable />
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
            backgroundColor: scanningMode === 'reserved' ? 'primary.main' : 'secondary.main',
            color: 'white',
            py: 2
          }}>
            {scanningMode === 'reserved' ? 'Quét mã QR nhận sách' : 'Quét mã QR trả sách'}
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
                {scanningMode === 'reserved' 
                  ? 'Đặt mã QR vào khung hình để quét và xác nhận nhận sách'
                  : 'Đặt mã QR vào khung hình để quét và xác nhận trả sách'}
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
