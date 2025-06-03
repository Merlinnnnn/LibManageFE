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
    Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
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

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Access Requests</DialogTitle>
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
                                    <TableCell>ID</TableCell>
                                    <TableCell>Requester ID</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Request Time</TableCell>
                                    <TableCell>Decision Time</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {accessRequests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell>{request.id}</TableCell>
                                        <TableCell>{request.requesterId}</TableCell>
                                        <TableCell>{request.status}</TableCell>
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
