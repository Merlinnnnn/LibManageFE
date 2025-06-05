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
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import apiService from '@/app/untils/api';
import { useRouter } from 'next/navigation';

interface Upload {
  uploadId: number;
  fileName: string;
  fileType: string;
  filePath: string;
  uploadedAt: string;
}

interface DigitalDocument {
  digitalDocumentId: number;
  documentName: string;
  author: string;
  publisher: string;
  description: string;
  coverImage: string | null;
  approvalStatus: string;
  visibilityStatus: string;
  uploads: Upload[];
}

interface ApiResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    content: DigitalDocument[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
    sortDetails: any[];
  };
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'APPROVED_BY_AI':
      return 'Đã duyệt bởi AI';
    case 'REJECTED_BY_AI':
      return 'Từ chối bởi AI';
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED_BY_AI':
      return 'success';
    case 'REJECTED_BY_AI':
      return 'error';
    default:
      return 'default';
  }
};

const PendingApprovalTable = () => {
  const theme = useTheme();
  const [documents, setDocuments] = useState<DigitalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const router = useRouter();

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await apiService.get<ApiResponse>('/api/v1/digital-documents/pending-approval');
      if (response.data.success) {
        setDocuments(response.data.data.content);
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
    fetchDocuments();
  }, []);

  const handleReadPdf = (uploadId: number) => {
    router.push(`/adminreadbook?id=${uploadId}`);
  };

  const handleReadWord = (uploadId: number) => {
    router.push(`/adminreadbook?id=${uploadId}`);
  };

  const handleApprove = async (id: number) => {
    try {
      await apiService.post(`/api/v1/digital-documents/approve/${id}`);
      setSnackbarMessage('Duyệt thành công');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      fetchDocuments();
    } catch (error) {
      setSnackbarMessage('Có lỗi khi duyệt');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await apiService.post(`/api/v1/digital-documents/recject/${id}`);
      setSnackbarMessage('Từ chối thành công');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      fetchDocuments();
    } catch (error) {
      setSnackbarMessage('Có lỗi khi từ chối');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
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
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Quản lý yêu cầu đăng tải sách
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Tên sách</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tác giả</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Nhà xuất bản</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Mô tả</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Không có yêu cầu nào được tìm thấy
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.digitalDocumentId}>
                  <TableCell>{doc.documentName}</TableCell>
                  <TableCell>{doc.author}</TableCell>
                  <TableCell>{doc.publisher}</TableCell>
                  <TableCell>{doc.description}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(doc.approvalStatus)}
                      color={getStatusColor(doc.approvalStatus) as any}
                      size="small"
                      sx={{ borderRadius: 2 }}
                    />
                  </TableCell>
                  <TableCell>
                    {doc.uploads.some(u => u.fileType === 'application/pdf') && (
                      <Tooltip title="Đọc PDF">
                        <IconButton color="primary" onClick={() => handleReadPdf(doc.uploads.find(u => u.fileType === 'application/pdf')!.uploadId)}>
                          <DescriptionIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {doc.uploads.some(u => u.fileType === 'application/msword' || u.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') && (
                      <Tooltip title="Đọc Word">
                        <IconButton color="secondary" onClick={() => handleReadWord(doc.uploads.find(u => u.fileType === 'application/msword' || u.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')!.uploadId)}>
                          <DescriptionIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Duyệt">
                      <IconButton color="success" onClick={() => handleApprove(doc.digitalDocumentId)}>
                        <CheckIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Từ chối">
                      <IconButton color="error" onClick={() => handleReject(doc.digitalDocumentId)}>
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={3000} 
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PendingApprovalTable;
