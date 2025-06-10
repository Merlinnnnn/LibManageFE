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
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                }
            }}
        >
            <DialogTitle 
                sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    pr: 1,
                    pb: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    background: 'linear-gradient(45deg, #6a1b9a 30%, #9c27b0 90%)',
                    color: 'white'
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Danh sách yêu cầu truy cập
                </Typography>
                <IconButton 
                    aria-label="close" 
                    onClick={onClose} 
                    size="small"
                    sx={{ 
                        color: 'white',
                        '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress size={40} />
                    </Box>
                ) : error ? (
                    <Box 
                        display="flex" 
                        justifyContent="center" 
                        alignItems="center" 
                        minHeight="200px"
                        bgcolor="error.light"
                        borderRadius={2}
                        p={3}
                    >
                        <Typography color="error.main" variant="h6">
                            {error}
                        </Typography>
                    </Box>
                ) : accessRequests.length === 0 ? (
                    <Box 
                        display="flex" 
                        flexDirection="column"
                        justifyContent="center" 
                        alignItems="center" 
                        minHeight="200px"
                        bgcolor="grey.50"
                        borderRadius={2}
                        p={3}
                    >
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Chưa có yêu cầu truy cập
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Sẽ hiển thị tại đây khi có người yêu cầu truy cập tài liệu của bạn
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer 
                        component={Paper}
                        sx={{ 
                            mt: 2,
                            borderRadius: 2,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                            overflow: 'hidden'
                        }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>Người mượn</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Thời gian yêu cầu</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Thời gian quyết định</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {accessRequests.map((request) => (
                                    <TableRow 
                                        key={request.id}
                                        sx={{ 
                                            '&:hover': {
                                                backgroundColor: 'grey.50'
                                            }
                                        }}
                                    >
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {request.requesterName || request.requesterId}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getStatusLabel(request.status)}
                                                color={getStatusColor(request.status) as any}
                                                size="small"
                                                sx={{ 
                                                    borderRadius: 2,
                                                    fontWeight: 500,
                                                    fontSize: 13,
                                                    minWidth: 100
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {new Date(request.requestTime).toLocaleString('vi-VN')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {request.decisionTime 
                                                    ? new Date(request.decisionTime).toLocaleString('vi-VN')
                                                    : 'Đang chờ'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {request.status === 'PENDING' && (
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Tooltip title="Duyệt yêu cầu">
                                                        <IconButton 
                                                            onClick={() => handleApprove(request.id)}
                                                            color="success"
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: 'success.light',
                                                                '&:hover': {
                                                                    backgroundColor: 'success.main',
                                                                    color: 'white'
                                                                }
                                                            }}
                                                        >
                                                            <CheckCircleIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Từ chối yêu cầu">
                                                        <IconButton 
                                                            onClick={() => handleReject(request.id)}
                                                            color="error"
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: 'error.light',
                                                                '&:hover': {
                                                                    backgroundColor: 'error.main',
                                                                    color: 'white'
                                                                }
                                                            }}
                                                        >
                                                            <CancelIcon fontSize="small" />
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
