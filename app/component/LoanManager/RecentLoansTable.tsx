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
} from '@mui/material';
import apiService from '../../untils/api';
import DoneIcon from '@mui/icons-material/Done';
import BlockIcon from '@mui/icons-material/Block';
import ClearIcon from '@mui/icons-material/Clear';

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

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        try {
            const response = await apiService.get<{ result: { content: Loan[] } }>('/api/v1/loan-transactions');
            setLoans(response.data.result.content);
        } catch (error) {
            console.error("Lỗi khi gọi API danh sách khoản vay:", error);
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
            await apiService.patch('/api/v1/loan-transactions', {
                transactionId,
                action,
            });
            setLoans(loans.map(loan =>
                loan.transactionId === transactionId ? { ...loan, status: action } : loan
            ));
        } catch (error) {
            console.error("Lỗi khi thực hiện hành động:", error);
        }
    };

    const getStatusColor = (status: string) => {
        const style = {
            borderRadius: '8px',
            padding: '4px 8px',
            display: 'inline-block',
            fontWeight: 'bold',
            textTransform: 'none'
        };
        
        switch (status) {
            case 'APPROVED':
                return { ...style, backgroundColor: '#ebfaf4', color: '#2e7d32' }; // Chỉnh màu chữ cho dễ nhìn
            case 'CANCEL':
                return { ...style, backgroundColor: '#f8d7da', color: '#721c24' };
            case 'PENDING':
                return { ...style, backgroundColor: '#fff3cd', color: '#856404' };
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
                                    <Box 
                                        sx={{ 
                                            ...getStatusColor(loan.status) 
                                        }}
                                    >
                                        {loan.status.toLowerCase()}
                                    </Box>
                                </TableCell>
                                <TableCell style={{ padding: '4px 8px' }}>
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
        </Box>
    );
};

export default RecentLoansTable;
