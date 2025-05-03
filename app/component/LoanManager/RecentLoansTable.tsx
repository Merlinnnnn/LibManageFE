import React, { useState, useEffect } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    TablePagination,
    Box,
    Snackbar,
    Alert,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Grid
} from '@mui/material';
import apiService from '../../untils/api';
import DoneIcon from '@mui/icons-material/Done';
import BlockIcon from '@mui/icons-material/Block';
import ClearIcon from '@mui/icons-material/Clear';
import useWebSocket from '@/app/services/useWebSocket';

interface Loan {
    transactionId: number;
    documentName: string;
    username: string;
    loanDate: string;
    dueDate: string | null;
    status: string;
}

const RecentLoansTable: React.FC = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);

    // Snackbar state
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    // Filter state
    const [filterStatus, setFilterStatus] = useState<string>('ALL');

    useEffect(() => {
        fetchLoans();
    }, []);

    useEffect(() => {
        // Lọc các khoản vay dựa trên trạng thái
        if (filterStatus === 'ALL') {
            setFilteredLoans(loans);
        } else {
            setFilteredLoans(loans.filter(loan => loan.status === filterStatus));
        }
    }, [filterStatus, loans]);

    // useWebSocket((loan: Loan) => {
    //     setLoans((prevLoans) => {
    //         const existingLoanIndex = prevLoans.findIndex(existingLoan => existingLoan.transactionId === loan.transactionId);

    //         if (existingLoanIndex !== -1) {
    //             // Nếu trùng, cập nhật loan cũ
    //             const updatedLoans = [...prevLoans];
    //             updatedLoans[existingLoanIndex] = loan;  // Thay thế loan cũ bằng loan mới
    //             return updatedLoans;
    //         } else {
    //             return [loan, ...prevLoans];
    //         }
    //     });
    // });

    const fetchLoans = async () => {
        try {
            const response = await apiService.get<{ data: { content: Loan[] } }>('/api/v1/loans');
            console.log(response);
            setLoans(response.data.data.content);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu khoản vay';
            setSnackbarMessage(errorMessage);
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleLoanAction = async (transactionId: number, action: 'APPROVE' | 'REJECTED' | 'CANCEL') => {
        try {
            const response = await apiService.patch('/api/v1/loan-transactions', {
                transactionId,
                action,
            });
            setLoans(loans.map(loan =>
                loan.transactionId === transactionId ? { ...loan, status: action } : loan
            ));
            setSnackbarMessage(`Đã ${action.toLowerCase()} thành công!`);
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi thực hiện hành động';
            setSnackbarMessage(errorMessage);
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const getStatusColor = (status: string) => {
        const style = {
            borderRadius: '5px',
            padding: '4px 8px',
            display: 'inline-block',
            fontWeight: 'bold',
            textTransform: 'none',
        };
        switch (status) {
            case 'APPROVED':
                return { ...style, backgroundColor: '#e8f5e9', color: '#388e3c', border: '1px solid #388e3c' }; // Approved (Green)
            case 'CANCEL':
                return { ...style, backgroundColor: '#ffebee', color: '#d32f2f', border: '1px solid #d32f2f' }; // Cancel (Red)
            case 'PENDING':
                return { ...style, backgroundColor: '#e3f2fd', color: '#1976d2', border: '1px solid #1976d2' }; // Pending (Blue)
            case 'RECEIVED':
                return { ...style, backgroundColor: '#e8f5e9', color: '#388e3c', border: '1px solid #388e3c' }; // Received (Green)
            case 'RETURNED':
                return { ...style, backgroundColor: '#f3e5f5', color: '#9c27b0', border: '1px solid #9c27b0' }; // Returned (Purple)
            default:
                return style;
        }
    };

    return (
        <Box>
            <TableContainer component={Paper} style={{ maxHeight: '300px', overflow: 'auto' }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ padding: '4px 8px' }}>Transaction ID</TableCell>
                            <TableCell style={{ padding: '4px 8px' }}>Document Name</TableCell>
                            <TableCell style={{ padding: '4px 8px' }}>Username</TableCell>
                            <TableCell style={{ padding: '4px 8px' }}>Loan Date</TableCell>

                            {/* Cột Status */}
                            <TableCell style={{ padding: '4px 8px' }}>
                                <Grid container spacing={1} alignItems="center">
                                    <Grid item>
                                        Status
                                    </Grid>
                                    <Grid item>
                                        <FormControl fullWidth size="small">
                                            <Select
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value)}
                                                label="Status Filter"
                                            >
                                                <MenuItem value="ALL">All</MenuItem>
                                                <MenuItem value="PENDING">Pending</MenuItem>
                                                <MenuItem value="APPROVED">Approved</MenuItem>
                                                <MenuItem value="CANCEL">Cancel</MenuItem>
                                                <MenuItem value="RECEIVED">Received</MenuItem>
                                                <MenuItem value="RETURNED">Returned</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </TableCell>

                            <TableCell style={{ padding: '4px 8px' }}>Action</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredLoans.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((loan) => (
                            <TableRow key={loan.transactionId}>
                                <TableCell style={{ padding: '4px 8px' }}>{loan.transactionId}</TableCell>
                                <TableCell style={{ padding: '4px 8px' }}>{loan.documentName}</TableCell>
                                <TableCell style={{ padding: '4px 8px' }}>{loan.username}</TableCell>
                                <TableCell style={{ padding: '4px 8px' }}>{loan.loanDate}</TableCell>

                                {/* Cột Status */}
                                <TableCell style={{ padding: '4px 8px' }}>
                                    <Box sx={getStatusColor(loan.status)}>
                                        {loan.status}
                                    </Box>
                                </TableCell>

                                <TableCell style={{ padding: '4px 8px' }}>
                                    {loan.status === 'PENDING' ? (
                                        <>
                                            <Tooltip title="Approve">
                                                <IconButton color="primary" onClick={() => handleLoanAction(loan.transactionId, 'APPROVE')}>
                                                    <DoneIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Reject">
                                                <IconButton color="secondary" onClick={() => handleLoanAction(loan.transactionId, 'REJECTED')}>
                                                    <BlockIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    ) : loan.status === 'APPROVED' ? (
                                        <Tooltip title="Cancel">
                                            <IconButton color="error" onClick={() => handleLoanAction(loan.transactionId, 'CANCEL')}>
                                                <ClearIcon />
                                            </IconButton>
                                        </Tooltip>
                                    ) : null}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredLoans.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                <Alert severity={snackbarSeverity} onClose={() => setOpenSnackbar(false)}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default RecentLoansTable;
