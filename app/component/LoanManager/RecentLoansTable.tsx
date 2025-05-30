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
    Tooltip
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import apiService from '@/app/untils/api';

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

interface RecentLoansTableProps {
    onScanQR: (mode: 'reserved' | 'return', loanId: number) => void;
}

const STATUS_OPTIONS = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'RESERVED', label: 'Đang chờ nhận sách' },
    { value: 'BORROWED', label: 'Đang mượn' },
    { value: 'RETURNED', label: 'Đã trả' }
];

const RecentLoansTable: React.FC<RecentLoansTableProps> = ({ onScanQR }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [showQrDialog, setShowQrDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showFilters, setShowFilters] = useState(false);

    const fetchLoans = async () => {
        try {
            const response = await apiService.get<ApiResponse>('/api/v1/loans', {
                params: {
                    page: 0,
                    size: 10,
                    sort: 'loanDate,desc',
                    search: searchQuery || undefined,
                    status: statusFilter !== 'ALL' ? statusFilter : undefined
                }
            });

            if (response.data.success) {
                setLoans(response.data.data.content);
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
    }, [searchQuery, statusFilter]);

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

            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tên sách</TableCell>
                            <TableCell>Người mượn</TableCell>
                            <TableCell>Ngày mượn</TableCell>
                            <TableCell>Hạn trả</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell>Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loans.map((loan) => (
                            <TableRow key={loan.transactionId}>
                                <TableCell>{loan.documentName}</TableCell>
                                <TableCell>{loan.username}</TableCell>
                                <TableCell>{new Date(loan.loanDate).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : '-'}
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={getStatusText(loan.status)}
                                        color={getStatusColor(loan.status) as any}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {loan.status === 'RESERVED' && (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => onScanQR('reserved', loan.transactionId)}
                                            startIcon={<QrCodeIcon />}
                                            sx={{ mr: 1 }}
                                        >
                                            Quét nhận sách
                                        </Button>
                                    )}
                                    {loan.status === 'BORROWED' && (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => onScanQR('return', loan.transactionId)}
                                            startIcon={<QrCodeIcon />}
                                            color="secondary"
                                        >
                                            Quét trả sách
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* QR Code Dialog */}
            <Dialog 
                open={showQrDialog} 
                onClose={handleCloseQrDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {selectedLoan?.status === 'RESERVED' ? 'Quét mã QR nhận sách' : 'Quét mã QR trả sách'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        gap: 2,
                        py: 2
                    }}>
                        {qrCodeUrl && (
                            <Box
                                component="img"
                                src={qrCodeUrl}
                                alt="QR Code"
                                sx={{
                                    width: 200,
                                    height: 200,
                                    objectFit: 'contain'
                                }}
                            />
                        )}
                        <Typography variant="body2" color="text.secondary" align="center">
                            {selectedLoan?.status === 'RESERVED' 
                                ? 'Quét mã QR để xác nhận người dùng nhận sách'
                                : 'Quét mã QR để xác nhận người dùng trả sách'}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseQrDialog}>
                        Đóng
                    </Button>
                    <Button 
                        variant="contained"
                        onClick={() => {
                            if (selectedLoan) {
                                onScanQR(selectedLoan.status === 'RESERVED' ? 'reserved' : 'return', selectedLoan.transactionId);
                                handleCloseQrDialog();
                            }
                        }}
                    >
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RecentLoansTable; 
