import React, { useEffect, useState } from 'react';
import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip, TablePagination, Box, Chip, Typography, CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import apiService from '../../untils/api';

interface AccessRequest {
    id: number;
    coverImage?: string;
    digitalId: number;
    requesterId: string;
    ownerId: string;
    status: string;
    requestTime: string;
    decisionTime: string | null;
    reviewerId: string | null;
    licenseExpiry: string | null;
    requesterName: string;
    ownerName: string;
}

const AccessListTable: React.FC = () => {
    const [requests, setRequests] = useState<AccessRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await apiService.get<{ data: AccessRequest[] }>(`/api/v1/access-requests/digital`);
            setRequests(response.data.data);
        } catch (error) {
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await apiService.post(`/api/v1/access-requests/${id}/approve`);
            fetchRequests();
        } catch (error) {
            // handle error
        }
    };

    const handleReject = async (id: number) => {
        try {
            await apiService.post(`/api/v1/access-requests/${id}/reject`);
            fetchRequests();
        } catch (error) {
            // handle error
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'error';
            default: return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Đang chờ';
            case 'APPROVED': return 'Đã duyệt';
            case 'REJECTED': return 'Từ chối';
            default: return status;
        }
    };

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Quản lý yêu cầu truy cập</Typography>
            <Paper sx={{ width: '100%', overflow: 'auto' }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Ảnh</TableCell>
                                    <TableCell>Email người mượn</TableCell>
                                    <TableCell>Email chủ sở hữu</TableCell>
                                    <TableCell>Trạng thái</TableCell>
                                    <TableCell>Thời gian yêu cầu</TableCell>
                                    <TableCell>Thời gian quyết định</TableCell>
                                    <TableCell>Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {requests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{row.id}</TableCell>
                                        <TableCell>
                                            {row.coverImage && (
                                                <img src={row.coverImage} alt="cover" style={{ width: 40, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                                            )}
                                        </TableCell>
                                        <TableCell>{row.requesterName}</TableCell>
                                        <TableCell>{row.ownerName}</TableCell>
                                        <TableCell>
                                            <Chip label={getStatusLabel(row.status)} color={getStatusColor(row.status) as any} size="small" />
                                        </TableCell>
                                        <TableCell>{new Date(row.requestTime).toLocaleString('vi-VN')}</TableCell>
                                        <TableCell>{row.decisionTime ? new Date(row.decisionTime).toLocaleString('vi-VN') : 'Đang chờ'}</TableCell>
                                        <TableCell>
                                            {row.status === 'PENDING' && (
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Tooltip title="Duyệt yêu cầu">
                                                        <IconButton color="success" onClick={() => handleApprove(row.id)}>
                                                            <CheckCircleIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Từ chối yêu cầu">
                                                        <IconButton color="error" onClick={() => handleReject(row.id)}>
                                                            <CancelIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                <TablePagination
                    component="div"
                    count={requests.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </Paper>
        </Box>
    );
};

export default AccessListTable;
