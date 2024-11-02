// Dashboard.tsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Tabs,
    Tab,
    TablePagination,
    Button,
} from '@mui/material';
import Sidebar from '../SideBar';
import apiService from '../../untils/api';

// Định nghĩa interface cho Loan
interface Loan {
    id: number;
    loanId: string;
    studentName: string;
    dateIssued: string;
    status: string;
}

const LoanManager: React.FC = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const [page, setPage] = useState(0);
    const [loans, setLoans] = useState<Loan[]>([]);
    const rowsPerPage = 25;

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                const response = await apiService.get<Loan[]>('http://localhost:8009/api/v1/loan-transactions');
                console.log(response);
                setLoans(response.data.result.content);
            } catch (error) {
                console.error("Lỗi khi gọi API danh sách khoản vay:", error);
            }
        };
        fetchLoans();
    }, []);


    // Xử lý chuyển tab
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
        setPage(0); // Reset lại trang về 0 khi chuyển tab
    };

    // Xử lý chuyển trang trong bảng
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    // Xử lý hành động chấp nhận hoặc từ chối khoản vay
    const handleLoanAction = async (transactionId: number, action: 'ACCEPT' | 'REFUSE') => {
        try {
            // Gọi API để chấp nhận hoặc từ chối khoản vay
            await apiService.post('http://localhost:8009/api/v1/loan-transactions', {
                transactionId,
                action: action === 'ACCEPT' ? 'ACCEPT_REQUEST' : 'REFUSE_REQUEST',
            });
            console.log(`Loan ${transactionId} đã được ${action === 'ACCEPT' ? 'chấp nhận' : 'từ chối'}`);

            // Cập nhật lại danh sách khoản vay sau khi có thay đổi trạng thái
            setLoans(loans.map(loan =>
                loan.id === transactionId ? { ...loan, status: action === 'ACCEPT' ? 'Accepted' : 'Refused' } : loan
            ));
        } catch (error) {
            console.error("Lỗi khi thực hiện hành động:", error);
        }
    };

    return (
        <Box display="flex" height="100vh">
            {/* Sidebar */}
            <Box width="250px" bgcolor="#333" color="white" height="100vh">
                <Sidebar />
            </Box>

            {/* Main Content */}
            <Box flex={1} p={3} overflow="auto" height="100vh">
                <Typography variant="h4" gutterBottom>
                    Dashboard
                </Typography>

                {/* Các thẻ thống kê */}
                <Grid container spacing={3}>
                    <Grid item xs={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">TOTAL BOOKS</Typography>
                                <Typography variant="h4">130</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">TOTAL STUDENTS</Typography>
                                <Typography variant="h4">84</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">TOTAL REVENUE</Typography>
                                <Typography variant="h4">₹ 1,20,300</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">TOTAL BOOKS LOAN</Typography>
                                <Typography variant="h4">35</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Tab Section cho các bảng */}
                <Box mt={4}>
                    <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
                        <Tab label="NEW STUDENTS" />
                        <Tab label="RECENT LOANS" />
                        <Tab label="RECENT SUBSCRIPTIONS" />
                    </Tabs>
                    <Box mt={2}>
                        <TableContainer component={Paper} style={{ maxHeight: '300px', overflow: 'auto' }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        {tabIndex === 1 && (
                                            <>
                                                <TableCell>Loan ID</TableCell>
                                                <TableCell>Student Name</TableCell>
                                                <TableCell>Date Issued</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Action</TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(Array.isArray(loans) ? loans : []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((loan) => (
                                        <TableRow key={loan.id}>
                                            <TableCell>{loan.id}</TableCell>
                                            <TableCell>{loan.loanId}</TableCell>
                                            <TableCell>{loan.studentName}</TableCell>
                                            <TableCell>{loan.dateIssued}</TableCell>
                                            <TableCell>{loan.status}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => handleLoanAction(loan.id, 'ACCEPT')}
                                                >
                                                    Accept
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="secondary"
                                                    size="small"
                                                    onClick={() => handleLoanAction(loan.id, 'REFUSE')}
                                                    style={{ marginLeft: '8px' }}
                                                >
                                                    Refuse
                                                </Button>
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
                            rowsPerPageOptions={[25]}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default LoanManager;
