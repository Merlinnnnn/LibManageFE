import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    CircularProgress,
    Box,
    IconButton,
    Tooltip,
    Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import apiService from '@/app/untils/api';
import { AccessRequest, AccessListResponse } from '@/app/types/interfaces';

interface AccessListProps {
    open: boolean;
    onClose: () => void;
    uploadId: number;
}

const AccessList: React.FC<AccessListProps> = ({ open, onClose, uploadId }) => {
    const [loading, setLoading] = useState(true);
    const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && uploadId) {
            fetchAccessRequests();
        }
    }, [open, uploadId]);

    const fetchAccessRequests = async () => {
        try {
            setLoading(true);
            const response = await apiService.get<AccessListResponse>(`/api/v1/access-requests/digital/${uploadId}`);
            console.log('response', response);
            if (response.data.success) {
                setAccessRequests(response.data.data.borrowers);
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError('Failed to fetch access requests');
            console.error('Error fetching access requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId: number) => {
        try {
            const response = await apiService.post<{success: boolean}>(`/api/v1/access-requests/${requestId}/approve`);
            console.log('response', response);
            if (response.data.success) {
                fetchAccessRequests();
            }
        } catch (error) {
            console.error('Error approving request:', error);
        }
    };

    const handleReject = async (requestId: number) => {
        try {
            const response = await apiService.post<{success: boolean}>(`/api/v1/access-requests/${requestId}/reject`);
            console.log('response', response);
            if (response.data.success) {
                fetchAccessRequests();
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'warning';
            case 'APPROVED':
                return 'success';
            case 'REJECTED':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'Đang chờ';
            case 'APPROVED':
                return 'Đã duyệt';
            case 'REJECTED':
                return 'Từ chối';
            default:
                return status;
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
                Access Requests
                <IconButton aria-label="close" onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : accessRequests.length === 0 ? (
                    <Typography>No access requests found</Typography>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Người mượn</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Request Time</TableCell>
                                    <TableCell>Decision Time</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {accessRequests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell>{request.requesterName || request.requesterId}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getStatusLabel(request.status)}
                                                color={getStatusColor(request.status) as any}
                                                size="small"
                                                sx={{ borderRadius: 2, fontWeight: 500, fontSize: 14 }}
                                            />
                                        </TableCell>
                                        <TableCell>{new Date(request.requestTime).toLocaleString()}</TableCell>
                                        <TableCell>
                                            {request.decisionTime 
                                                ? new Date(request.decisionTime).toLocaleString()
                                                : 'Pending'}
                                        </TableCell>
                                        <TableCell>
                                            {request.status === 'PENDING' && (
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Tooltip title="Approve Request">
                                                        <IconButton 
                                                            onClick={() => handleApprove(request.id)}
                                                            color="success"
                                                            size="small"
                                                        >
                                                            <CheckCircleIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Reject Request">
                                                        <IconButton 
                                                            onClick={() => handleReject(request.id)}
                                                            color="error"
                                                            size="small"
                                                        >
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
            </DialogContent>
        </Dialog>
    );
};

export default AccessList;
