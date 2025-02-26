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
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
} from '@mui/material';
import apiService from '../../untils/api';
import DoneIcon from '@mui/icons-material/Done';
import useWebSocket from '@/app/services/useWebSocket';

interface ReturnRequest {
    transactionId: number;
    documentName: string;
    username: string;
    returnDate: string;
    status: string;
}

const ReturnRequestsTable: React.FC = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [requests, setRequests] = useState<ReturnRequest[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
    const [isBookDamaged, setIsBookDamaged] = useState(false);
    const [fineAmount, setFineAmount] = useState('');
    const [fineReason, setFineReason] = useState('');

    useEffect(() => {
        fetchReturnRequests();
    }, []);
    // useWebSocket((request: ReturnRequest) => {
    //     // Cập nhật danh sách thông báo khi nhận được thông báo mới từ WebSocket
    //     setRequests((preRequests) => [request, ...preRequests]);
    //     //setUnreadCount((prevCount) => prevCount + 1);
    // });

    const fetchReturnRequests = async () => {
        try {
            const response = await apiService.get<{ result: { content: ReturnRequest[] } }>('/api/v1/loan-transactions');
            const filteredRequests = response.data.result.content.filter(
                (request) => request.status === 'RETURN_REQUESTED'
            );
            setRequests(filteredRequests);
        } catch (error) {
            console.log("Lỗi khi gọi API danh sách yêu cầu trả:", error);
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const openConfirmDialog = (transactionId: number) => {
        setSelectedRequestId(transactionId);
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setSelectedRequestId(null);
        setFineAmount('');
        setFineReason('');
        setIsBookDamaged(false);
    };

    const handleConfirm = async () => {
        if (selectedRequestId === null) return;

        try {
            await apiService.patch('/api/v1/loan-transactions/confirm-return', {
                transactionId: selectedRequestId,
                isBookDamaged: isBookDamaged.toString(),
                fineAmount: fineAmount,
                fineReason: fineReason,
                payment_method: '',
                status: "PAID"
            });
            fetchReturnRequests();
            handleDialogClose();
        } catch (error) {
            console.log("Lỗi khi thực hiện xác nhận:", error);
        }
    };

    return (
        <Box>
            <TableContainer component={Paper} style={{ maxHeight: '300px', overflow: 'auto' }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ padding: '4px 8px' }}>Request ID</TableCell>
                            <TableCell style={{ padding: '4px 8px' }}>Document Name</TableCell>
                            <TableCell style={{ padding: '4px 8px' }}>Username</TableCell>
                            <TableCell style={{ padding: '4px 8px' }}>Request Date</TableCell>
                            <TableCell style={{ padding: '4px 8px' }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((request) => (
                            <TableRow key={request.transactionId}>
                                <TableCell style={{ padding: '4px 8px' }}>{request.transactionId}</TableCell>
                                <TableCell style={{ padding: '4px 8px' }}>{request.documentName}</TableCell>
                                <TableCell style={{ padding: '4px 8px' }}>{request.username}</TableCell>
                                <TableCell style={{ padding: '4px 8px' }}>{request.returnDate}</TableCell>
                                <TableCell style={{ padding: '4px 8px' }}>
                                    <Tooltip title="Confirm">
                                        <IconButton color="primary" onClick={() => openConfirmDialog(request.transactionId)}>
                                            <DoneIcon />
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
                count={requests.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />

            <Dialog open={openDialog} onClose={handleDialogClose}>
                <DialogTitle>Xác nhận trả sách</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Vui lòng nhập các thông tin cần thiết trước khi xác nhận trả sách.
                    </DialogContentText>
                    <FormControl fullWidth margin="dense" variant="outlined">
                        <InputLabel>Book Damaged</InputLabel>
                        <Select
                            label="Book Damaged"
                            value={isBookDamaged}
                            onChange={(e) => setIsBookDamaged(e.target.value === 'true')}
                        >
                            <MenuItem value="false">False</MenuItem>
                            <MenuItem value="true">True</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        margin="dense"
                        label="Fine Amount"
                        type="number"
                        value={fineAmount}
                        onChange={(e) => setFineAmount(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Fine Reason"
                        value={fineReason}
                        onChange={(e) => setFineReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Hủy</Button>
                    <Button onClick={handleConfirm} color="primary">Xác nhận</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReturnRequestsTable;
