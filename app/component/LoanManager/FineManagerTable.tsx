import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import WarningIcon from '@mui/icons-material/Warning';
import apiService from '@/app/untils/api';

interface Fine {
  id: number;
  loanId: number;
  amount: number;
  reason: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
}

interface Loan {
  transactionId: number;
  documentName: string;
  username: string;
  status: string;
}

interface ApiResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    content: Fine[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
}

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ thanh toán' },
  { value: 'PAID', label: 'Đã thanh toán' }
];

const FineManagerTable = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showCreateFineDialog, setShowCreateFineDialog] = useState(false);
  const [fineAmount, setFineAmount] = useState(0);
  const [fineReason, setFineReason] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const showNotification = (type: 'success' | 'error', message: string) => {
    setSnackbarSeverity(type);
    setSnackbarMessage(message);
    setOpenSnackbar(true);
  };

  const handleCloseFineDialog = () => {
    setShowCreateFineDialog(false);
    setSelectedLoan(null);
    setFineAmount(0);
    setFineReason('');
  };

  const fetchFines = async () => {
    try {
      const response = await apiService.get<ApiResponse>('/api/v1/fines', {
        params: {
          page: 0,
          size: 10,
          sort: 'createdAt,desc',
          search: searchQuery || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined
        }
      });

      if (response.data.success) {
        setFines(response.data.data.content);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, [searchQuery, statusFilter]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatusFilter(event.target.value);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
  };

  const handleCreateFine = async () => {
    if (!selectedLoan) return;

    try {
      const response = await apiService.post<ApiResponse>('/api/v1/fines', {
        loanId: selectedLoan.transactionId,
        amount: fineAmount,
        reason: fineReason
      });

      if (response.data.success) {
        showNotification('success', 'Tạo phạt thành công');
        handleCloseFineDialog();
        fetchFines();
      } else {
        showNotification('error', response.data.message);
      }
    } catch (error) {
      showNotification('error', 'Có lỗi xảy ra khi tạo phạt');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'PAID':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ thanh toán';
      case 'PAID':
        return 'Đã thanh toán';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Tìm kiếm theo lý do phạt..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchQuery('')}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                select
                fullWidth
                variant="outlined"
                value={statusFilter}
                onChange={handleStatusChange}
                label="Trạng thái"
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <Tooltip title="Xóa bộ lọc">
                <IconButton
                  onClick={handleClearFilters}
                  color="primary"
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1
                  }}
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <TableContainer 
        component={Paper} 
        sx={{ 
          mt: 2,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.background.default }}>
              <TableCell sx={{ fontWeight: 600 }}>Mã giao dịch</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Số tiền</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Lý do</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Ngày tạo</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Ngày thanh toán</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fines.map((fine) => (
              <TableRow 
                key={fine.id}
                sx={{ 
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
              >
                <TableCell>{fine.loanId}</TableCell>
                <TableCell>{fine.amount.toLocaleString('vi-VN')} VNĐ</TableCell>
                <TableCell>{fine.reason}</TableCell>
                <TableCell>{new Date(fine.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {fine.paidAt ? new Date(fine.paidAt).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusText(fine.status)}
                    color={getStatusColor(fine.status) as any}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={showCreateFineDialog} 
        onClose={handleCloseFineDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tạo phạt mới</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Số tiền phạt"
              type="number"
              fullWidth
              value={fineAmount}
              onChange={(e) => setFineAmount(Number(e.target.value))}
              InputProps={{
                endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>
              }}
            />
            <TextField
              label="Lý do phạt"
              multiline
              rows={3}
              fullWidth
              value={fineReason}
              onChange={(e) => setFineReason(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFineDialog}>
            Hủy
          </Button>
          <Button 
            variant="contained"
            color="error"
            onClick={handleCreateFine}
            startIcon={<WarningIcon />}
          >
            Tạo phạt
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
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FineManagerTable;
