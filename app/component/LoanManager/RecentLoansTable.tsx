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
    Alert
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

    // Snackbar state
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    useEffect(() => {
        fetchLoans();
    }, []);

    useWebSocket((loan: Loan) => {
        // Cập nhật danh sách khi nhận được thông báo mới từ WebSocket
        setLoans((prevLoans) => [loan, ...prevLoans]); // Fix: sử dụng prevLoans thay vì loans
    });

    const fetchLoans = async () => {
        try {
            const response = await apiService.get<{ result: { content: Loan[] } }>('/api/v1/loan-transactions');
            setLoans(response.data.result.content);
        } catch (error: any) {
            //console.error("Lỗi khi gọi API danh sách khoản vay:", error);
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
            //console.error("Lỗi khi thực hiện hành động:", error);
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
                            <TableCell style={{ padding: '4px 8px' }}>Status</TableCell>
                            <TableCell style={{ padding: '4px 8px' }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loans.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((loan) => (
                            <TableRow key={loan.transactionId}>
                                <TableCell style={{ padding: '4px 8px' }}>{loan.transactionId}</TableCell>
                                <TableCell style={{ padding: '4px 8px' }}>{loan.documentName}</TableCell>
                                <TableCell style={{ padding: '4px 8px' }}>{loan.username}</TableCell>
                                <TableCell style={{ padding: '4px 8px' }}>{loan.loanDate}</TableCell>
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
                                            <Tooltip title="Cancel">
                                                <IconButton color="default" onClick={() => handleLoanAction(loan.transactionId, 'CANCEL')}>
                                                    <ClearIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    ) : null}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={loans.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />

            {/* Snackbar for Notifications */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default RecentLoansTable;
