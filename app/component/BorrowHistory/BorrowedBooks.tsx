import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Button, Grid,
  Tooltip, IconButton, Dialog, DialogTitle, DialogContent,
  Snackbar, Alert, Tab, Tabs, useTheme, useMediaQuery, Chip
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import PaymentIcon from '@mui/icons-material/Payment';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import PaidIcon from '@mui/icons-material/Paid';
import RefreshIcon from '@mui/icons-material/Refresh';
import apiService from '@/app/untils/api';
import Header from '../Home/Header';
// Define the Book type
interface Book {
  transactionId: string;
  documentName: string;
  loanDate: string;
  returnDate?: string;
  status: string;
}

// Define the payment response type
interface PaymentResponse {
  message: string;
  code: number;
  result: {
    paymentUrl: string;
  };
}
interface ApiResponse {
  data?: {
    content?: Book[];
  };
}

const MaterialBorrowedBooks = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // State hooks
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeOpen, setQrCodeOpen] = useState<boolean>(false);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('PENDING');

  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  // Snackbar state
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  // Fetch books on component mount
  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  // Mock API call to fetch borrowed books
  const fetchBorrowedBooks = async () => {
    setLoading(true);
    try {
      const infoRaw = localStorage.getItem('info');
      if (!infoRaw) throw new Error('Không tìm thấy thông tin người dùng');

      const userInfo = JSON.parse(infoRaw);
      const userId = userInfo.userId;

      // Gọi API lấy sách đã mượn
      const response = await apiService.get<ApiResponse>('/api/v1/loans/user/borrowed-books', {
        params: { userId, page: 0, size: 10 },
      });
      console.log(response);
      // Kiểm tra dữ liệu trước khi sử dụng
      const content = response.data.data?.content;
      if (!Array.isArray(content)) throw new Error('Dữ liệu trả về không hợp lệ');

      setBooks(content);
      console.log('📚 Borrowed books:', content);
    } catch (error) {
      console.error(error);
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };


  // Show snackbar notification
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  // Get status style for different statuses
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return { color: 'success', label: 'Đã nhận' };
      case 'REJECTED':
        return { color: 'error', label: 'Từ chối' };
      case 'PENDING':
        return { color: 'info', label: 'Đang chờ' };
      case 'APPROVED':
        return { color: 'warning', label: 'Đã duyệt' };
      case 'RETURNED':
        return { color: 'secondary', label: 'Đã trả' };
      default:
        return { color: 'default', label: status };
    }
  };

  // Fetch QR code
  const fetchQrCode = async (id: string) => {
    try {
      // In a real app, this would be an API call to get the QR code
      // For demo, we'll use a placeholder QR code
      setQrCodeImage('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=Transaction' + id);
      setQrCodeOpen(true);

      showSnackbar('QR code loaded successfully', 'success');
    } catch (error) {
      showSnackbar('Error loading QR code', 'error');
    }
  };

  const handleQrCodeClick = (id: string) => {
    fetchQrCode(id);
  };

  const handleQrCodeClose = () => {
    setQrCodeOpen(false);
    setQrCodeImage(null);
  };

  const handlePaymentDialogClose = () => {
    setPaymentDialogOpen(false);
    setSelectedTransactionId(null);
  };

  const handlePaymentMethodSelect = async (method: 'online' | 'cash') => {
    if (selectedTransactionId && method === 'online') {
      try {
        // In a real app, this would be an API call to initiate payment
        // For demo, we'll simulate a successful payment response

        showSnackbar('Online payment initiated successfully', 'success');
      } catch (error) {
        showSnackbar('Error processing online payment', 'error');
      }
    } else if (method === 'cash') {
      showSnackbar('Cash payment option selected', 'info');
    }

    handlePaymentDialogClose();
  };

  // Filter books based on selected tab
  const filteredBooks = books.filter(book =>
    selectedTab === 'ALL' ? true : book.status === selectedTab
  );

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"
        sx={{
          backgroundColor: '#f9fafb',
          padding: 3
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"
        sx={{
          backgroundColor: '#f9fafb',
          padding: 3
        }}
      >
        <Typography color="error" variant="h6" sx={{ fontWeight: 'medium' }}>{error}</Typography>
      </Box>
    );
  }

  // Empty state
  if (books.length === 0) {
    return (
      <Box>
        <Header />

        <Box display="flex" justifyContent="center" alignItems="center" minHeight="85vh"
          sx={{
            backgroundColor: '#f9fafb',
            padding: 3
          }}
        >
          <Typography variant="h6" color="text.secondary">No books found</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Header />
      <Box sx={{ backgroundColor: '#f9fafb', minHeight: '85vh' }}>
        {/* Main content */}
        <Box
          display="flex"
          flexDirection={isMobile ? 'column' : 'row'}
          gap={3}
          sx={{ padding: isMobile ? 2 : 4 }}
        >
          {/* Sidebar with tabs */}
          <Box
            sx={{
              width: isMobile ? '100%' : '250px',
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              overflow: 'hidden',
              marginBottom: isMobile ? 3 : 0
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider', padding: 2, backgroundColor: '#f5f7f9' }}>
              <Typography variant="subtitle1" fontWeight="bold">Filter by Status</Typography>
            </Box>

            <Tabs
              orientation={isMobile ? "horizontal" : "vertical"}
              variant={isMobile ? "scrollable" : "standard"}
              value={selectedTab}
              onChange={(event, newValue) => setSelectedTab(newValue)}
              textColor="primary"
              indicatorColor="primary"
              sx={{
                minHeight: isMobile ? 'auto' : '400px',
                '& .MuiTab-root': {
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  justifyContent: isMobile ? 'center' : 'flex-start',
                  fontWeight: 'medium',
                  transition: 'all 0.2s ease'
                },
                '& .Mui-selected': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  fontWeight: 'bold',
                }
              }}
            >
              <Tab label="All Books" value="ALL" />
              <Tab label="Pending" value="PENDING" />
              <Tab label="Approved" value="APPROVED" />
              <Tab label="Received" value="RECEIVED" />
              <Tab label="Rejected" value="REJECTED" />
              <Tab label="Returned" value="RETURNED" />
            </Tabs>

            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={fetchBorrowedBooks}
                startIcon={<RefreshIcon />}
                sx={{
                  borderRadius: '8px',
                  fontWeight: 'medium',
                  textTransform: 'none',
                  boxShadow: 'none'
                }}
              >
                Refresh Data
              </Button>
            </Box>
          </Box>

          {/* Main content */}
          <Box sx={{
            flex: 1,
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            overflow: 'hidden'
          }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                Borrowed Books
              </Typography>

              {filteredBooks.length === 0 ? (
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  py: 10,
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  <Typography color="text.secondary">
                    No books found with this status
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{
                  boxShadow: 'none',
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  overflow: 'hidden',
                }}>
                  <Table sx={{ minWidth: isMobile ? 600 : 800 }}>
                    <TableHead sx={{ backgroundColor: '#f5f7f9' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Book Title</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Loan Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Return Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredBooks.map((book) => {
                        const status = getStatusStyle(book.status);

                        return (
                          <TableRow key={book.transactionId} sx={{
                            '&:hover': { backgroundColor: '#f5f7f9' },
                            transition: 'background-color 0.2s ease'
                          }}>
                            <TableCell sx={{ fontWeight: 'medium' }}>{book.transactionId}</TableCell>
                            <TableCell>{book.documentName}</TableCell>
                            <TableCell>
                              {new Date(book.loanDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {book.returnDate
                                ? new Date(book.returnDate).toLocaleDateString()
                                : 'Not yet returned'}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={status.label}
                                color={status.color as any}
                                variant="outlined"
                                size="small"
                                sx={{ fontWeight: 'medium' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                {book.status === 'RECEIVED' || book.status === 'APPROVED' ? (
                                  <Tooltip title="View QR Code">
                                    <IconButton
                                      edge="end"
                                      aria-label="qr code"
                                      onClick={() => handleQrCodeClick(book.transactionId)}
                                      sx={{
                                        color: 'black',
                                        padding: '8px',
                                        backgroundColor: 'rgba(0,0,0,0.04)',
                                        '&:hover': {
                                          backgroundColor: 'rgba(0,0,0,0.08)',
                                        }
                                      }}
                                    >
                                      <QrCodeIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                  </Tooltip>
                                ) : null}

                                {book.status === 'RETURNED' ? (
                                  <Tooltip title="Payment Options">
                                    <IconButton
                                      edge="end"
                                      aria-label="Payment"
                                      onClick={() => {
                                        setPaymentDialogOpen(true);
                                        setSelectedTransactionId(book.transactionId);
                                      }}
                                      sx={{
                                        color: 'black',
                                        padding: '8px',
                                        backgroundColor: 'rgba(0,0,0,0.04)',
                                        '&:hover': {
                                          backgroundColor: 'rgba(0,0,0,0.08)',
                                        }
                                      }}
                                    >
                                      <PaymentIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                  </Tooltip>
                                ) : null}
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Box>
        </Box>

        {/* Payment Dialog */}
        <Dialog
          open={paymentDialogOpen}
          onClose={handlePaymentDialogClose}
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: '12px',
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
            borderBottom: '1px solid #e0e0e0',
            py: 2
          }}>
            Select Payment Method
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Grid container spacing={3} justifyContent="center">
              {/* Cash Button */}
              <Grid item xs={12} md={6} display="flex" justifyContent="center">
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handlePaymentMethodSelect('cash')}
                  sx={{
                    width: '100%',
                    height: isTablet ? 200 : 260,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '16px',
                    padding: 4,
                    backgroundColor: '#f3e5f5',
                    color: '#9c27b0',
                    border: '1px solid #ce93d8',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#e1bee7',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      transform: 'translateY(-4px)'
                    },
                  }}
                >
                  <PaidIcon sx={{ fontSize: isTablet ? 60 : 80, mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Cash</Typography>
                </Button>
              </Grid>

              {/* Online Payment Button */}
              <Grid item xs={12} md={6} display="flex" justifyContent="center">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handlePaymentMethodSelect('online')}
                  sx={{
                    width: '100%',
                    height: isTablet ? 200 : 260,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '16px',
                    padding: 4,
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    border: '1px solid #90caf9',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#bbdefb',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      transform: 'translateY(-4px)'
                    },
                  }}
                >
                  <CreditScoreIcon sx={{ fontSize: isTablet ? 60 : 80, mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Online Payment</Typography>
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>

        {/* QR Code Dialog */}
        <Dialog
          open={qrCodeOpen}
          onClose={handleQrCodeClose}
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: '12px',
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
            borderBottom: '1px solid #e0e0e0',
            py: 2
          }}>
            Transaction QR Code
          </DialogTitle>
          <DialogContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Scan this QR code to confirm your transaction
            </Typography>

            {qrCodeImage && (
              <Box
                sx={{
                  maxWidth: '300px',
                  width: '100%',
                  margin: '0 auto',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  padding: '12px',
                  backgroundColor: '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}
              >
                <img
                  src={qrCodeImage}
                  alt="QR Code"
                  style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
                />
              </Box>
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
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity={snackbarSeverity}
            sx={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              borderRadius: '8px',
              fontWeight: 'medium'
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default MaterialBorrowedBooks;
