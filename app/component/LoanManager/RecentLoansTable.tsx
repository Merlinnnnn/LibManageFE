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
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    useTheme,
    useMediaQuery,
    TextField,
    InputAdornment,
    MenuItem,
    Grid,
    Tooltip,
    TablePagination,
    Fab,
    Snackbar
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import apiService from '@/app/untils/api';
import useWebSocket from '@/app/services/useWebSocket';

interface Loan {
    transactionId: number;
    documentId: string;
    physicalDocId: number;
    documentName: string;
    username: string;
    librarianId: string | null;
    loanDate: string;
    dueDate: string | null;
    returnDate: string | null;
    status: string;
    returnCondition: string | null;
    fineAmount?: number;
    paymentStatus?: string;
    librarianName?: string;
}

interface ApiResponse {
    code: number;
    message: string;
    success: boolean;
    data: {
        content: Loan[];
        pageNumber: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        last: boolean;
    };
}

interface LoanUpdate {
    transactionId: number;
    documentId: string;
    physicalDocId: number;
    documentName: string;
    username: string;
    librarianId: string | null;
    loanDate: string;
    dueDate: string | null;
    returnDate: string | null;
    status: string;
    returnCondition: string | null;
    fineAmount?: number;
    paymentStatus?: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
}

interface RecentLoansTableProps {
    onScanQR: () => void;
    refreshTrigger: number;
}

const STATUS_OPTIONS = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'RESERVED', label: 'Đang chờ nhận sách' },
    { value: 'BORROWED', label: 'Đang mượn' },
    { value: 'RETURNED', label: 'Đã trả' },
    { value: 'CANCELLED_AUTO', label: 'Bị hủy' }
];

const RecentLoansTable: React.FC<RecentLoansTableProps> = ({ onScanQR, refreshTrigger }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [loans, setLoans] = useState<Loan[]>([]);
    const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [showQrDialog, setShowQrDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showCashDialog, setShowCashDialog] = useState(false);
    const [cashLoan, setCashLoan] = useState<Loan | null>(null);
    const [cashLoading, setCashLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'}>({open: false, message: '', severity: 'success'});

    const fetchLoans = async () => {
        setLoading(true);
        try {
            const response = await apiService.get<ApiResponse>('/api/v1/loans', {
                params: {
                    page: 0,
                    size: 100, // Lấy nhiều dữ liệu hơn để lọc client-side
                    sort: 'loanDate,desc',
                    search: searchQuery || undefined
                }
            });

            if (response.data.success) {
                setLoans(response.data.data.content);
                setFilteredLoans(response.data.data.content);
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
        fetchLoans();
    }, [searchQuery, refreshTrigger]);

    // Lọc dữ liệu khi statusFilter thay đổi
    useEffect(() => {
        if (statusFilter === 'ALL') {
            setFilteredLoans(loans);
        } else {
            setFilteredLoans(loans.filter(loan => loan.status === statusFilter));
        }
        setPage(0); // Reset về trang đầu tiên khi lọc
    }, [statusFilter, loans]);

    // Xử lý cập nhật từ WebSocket
    useWebSocket((message: any) => {
        try {
            // Parse message từ _body nếu là binary message
            const messageBody = message._body || message.body;
            const parsedMessage = JSON.parse(messageBody);
            console.log('Parsed message:', parsedMessage);

            // Kiểm tra nếu là loan message (có transactionId)
            if (parsedMessage.transactionId) {
                console.log('Loan update received, fetching fresh data...');
                // Gọi lại API để lấy dữ liệu mới nhất
                fetchLoans();
            }
        } catch (err) {
            console.error('Error processing WebSocket message:', err);
            console.error('Raw message:', message);
        }
    });

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleShowQrCode = async (loan: Loan) => {
        try {
            const response = await apiService.get(`/api/v1/loans/${loan.transactionId}/qrcode-image`, {
                responseType: 'blob'
            });
            
            const imageUrl = URL.createObjectURL(response.data as Blob);
            setQrCodeUrl(imageUrl);
            setSelectedLoan(loan);
            setShowQrDialog(true);
        } catch (error) {
            console.error('Error fetching QR code:', error);
            setError('Không thể tải mã QR');
        }
    };

    const handleCloseQrDialog = () => {
        setShowQrDialog(false);
        setQrCodeUrl('');
        setSelectedLoan(null);
    };

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RESERVED':
                return 'warning';
            case 'BORROWED':
                return 'info';
            case 'RETURNED':
                return 'success';
            case 'CANCELLED_AUTO':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'RESERVED':
                return 'Đang chờ nhận sách';
            case 'BORROWED':
                return 'Đang mượn';
            case 'RETURNED':
                return 'Đã trả';
            case 'CANCELLED_AUTO':
                return 'Bị hủy';
            default:
                return status;
        }
    };

    const getPaymentStatus = (status: string) => {
        switch (status) {
            case 'NON_PAYMENT':
                return { label: 'Không bị phạt', color: 'default' };
            case 'UNPAID':
                return { label: 'Chưa đóng phạt', color: 'warning' };
            case 'PAID':
                return { label: 'Đã đóng', color: 'success' };
            default:
                return { label: status, color: 'default' };
        }
    };

    const handleOpenCashDialog = (loan: Loan) => {
        setCashLoan(loan);
        setShowCashDialog(true);
    };

    const handleCloseCashDialog = () => {
        setShowCashDialog(false);
        setCashLoan(null);
    };

    const handleConfirmCashPayment = async () => {
        if (!cashLoan) return;
        setCashLoading(true);
        try {
            await apiService.post(`/api/v1/loans/${cashLoan.transactionId}/paymentcash`);
            setSnackbar({open: true, message: 'Thanh toán tiền mặt thành công!', severity: 'success'});
            setShowCashDialog(false);
            setCashLoan(null);
            fetchLoans();
        } catch (err) {
            setSnackbar({open: true, message: 'Thanh toán thất bại!', severity: 'error'});
        } finally {
            setCashLoading(false);
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
        <Box id="recent-loans-table">
            <Box sx={{ mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Tìm kiếm theo tên sách hoặc người mượn..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                }
                            }}
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
                                            sx={{ 
                                                borderRadius: 1,
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                                }
                                            }}
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
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
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
                                        borderRadius: 2,
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                        }
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
                    borderRadius: 2,
                    overflow: 'hidden'
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: theme.palette.grey[200] }}>
                            <TableCell sx={{ fontWeight: 600, px: 2, py: 1.5, borderBottom: `2px solid ${theme.palette.divider}` }}>Tên sách</TableCell>
                            <TableCell sx={{ fontWeight: 600, px: 2, py: 1.5, borderBottom: `2px solid ${theme.palette.divider}` }}>Người mượn</TableCell>
                            <TableCell sx={{ fontWeight: 600, px: 2, py: 1.5, borderBottom: `2px solid ${theme.palette.divider}` }}>Người duyệt</TableCell>
                            <TableCell sx={{ fontWeight: 600, px: 2, py: 1.5, borderBottom: `2px solid ${theme.palette.divider}` }}>Ngày mượn</TableCell>
                            <TableCell sx={{ fontWeight: 600, px: 2, py: 1.5, borderBottom: `2px solid ${theme.palette.divider}` }}>Hạn trả</TableCell>
                            <TableCell sx={{ fontWeight: 600, px: 2, py: 1.5, borderBottom: `2px solid ${theme.palette.divider}` }}>Trạng thái</TableCell>
                            <TableCell sx={{ fontWeight: 600, px: 2, py: 1.5, borderBottom: `2px solid ${theme.palette.divider}` }}>Tiền phạt</TableCell>
                            <TableCell sx={{ fontWeight: 600, px: 2, py: 1.5, borderBottom: `2px solid ${theme.palette.divider}` }}>Thanh toán</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredLoans
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    Không có dữ liệu nào được tìm thấy
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredLoans
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((loan) => {
                                    const payment = getPaymentStatus(loan.paymentStatus || '');
                                    return (
                                        <TableRow key={loan.transactionId}>
                                            <TableCell>{loan.documentName}</TableCell>
                                            <TableCell>{loan.username}</TableCell>
                                            <TableCell>{loan.librarianName || '-'}</TableCell>
                                            <TableCell>{new Date(loan.loanDate).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={getStatusText(loan.status)}
                                                    color={getStatusColor(loan.status) as any}
                                                    size="small"
                                                    sx={{ borderRadius: 2 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {loan.fineAmount && loan.fineAmount > 0
                                                    ? loan.fineAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={payment.label}
                                                    color={payment.color as any}
                                                    size="small"
                                                    sx={{ borderRadius: 2 }}
                                                />
                                                {loan.paymentStatus === 'UNPAID' && (
                                                    <Tooltip title="Xác nhận thanh toán tiền mặt">
                                                        <IconButton size="small" color="success" onClick={() => handleOpenCashDialog(loan)}>
                                                            <AttachMoneyIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ 
                mt: 2, 
                display: 'flex', 
                justifyContent: 'flex-end',
                '& .MuiTablePagination-root': {
                    borderRadius: 2,
                }
            }}>
                <TablePagination
                    component="div"
                    count={filteredLoans.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage="Số hàng mỗi trang"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên ${count}`}
                />
            </Box>

            <Fab
                color="primary"
                aria-label="scan qr"
                onClick={onScanQR}
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 1000
                }}
            >
                <QrCodeIcon />
            </Fab>

            <Dialog open={showCashDialog} onClose={handleCloseCashDialog}>
                <DialogTitle>Xác nhận thanh toán tiền mặt</DialogTitle>
                <DialogContent>
                    Bạn có chắc chắn muốn xác nhận người dùng <b>{cashLoan?.username}</b> đã thanh toán tiền mặt cho khoản phạt này không?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCashDialog} disabled={cashLoading}>Hủy</Button>
                    <Button onClick={handleConfirmCashPayment} color="success" variant="contained" disabled={cashLoading}>
                        {cashLoading ? <CircularProgress size={20} /> : 'Xác nhận'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({...snackbar, open: false})}
                message={snackbar.message}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                ContentProps={{
                    style: { backgroundColor: snackbar.severity === 'success' ? '#43a047' : '#d32f2f', color: '#fff' }
                }}
            />
        </Box>
    );
};

export default RecentLoansTable; 
