import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Pagination,
  CircularProgress,
  Switch,
  Tooltip,
  TablePagination
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Key as KeyIcon,
  Delete as DeleteIcon,
  Autorenew as AutorenewIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import apiService from '../../untils/api';
import Sidebar from '../SideBar';

interface Book {
  documentId: number;
  documentName: string;
  author: string;
  publisher: string;
  documentCategory: string;
  description: string;
  coverImage: string | null;
  documentTypes: {
    documentTypeId: number;
    typeName: string;
  }[];
  courses: {
    courseId: number;
    courseName: string;
  }[];
  physicalDocument: {
    quantity: number;
    availableCopies: number;
  } | null;
  digitalDocument: {
    digitalDocumentId: number;
    uploads: {
      fileName: string;
      fileType: string;
    }[];
  } | null;
}

interface BooksApiResponse {
  code: number;
  message: string;
  data: {
    content: Book[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
}

interface DrmUpload {
  fileName: string;
  uploadId: number;
  filePath: string;
  uploadedAt: string;
  fileType: string;
  key: {
    createdAt: string;
    id: number;
    active: boolean;
    contentKey: string;
  };
}

interface DrmApiResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    uploads: DrmUpload[];
    documentName: string;
    digitalDocumentId: number;
  };
}

const TRUNCATE_LENGTH = 50;

export default function BookManager() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const [openDrmDialog, setOpenDrmDialog] = useState(false);
  const [drmData, setDrmData] = useState<DrmApiResponse['data'] | null>(null);
  const [loadingDrm, setLoadingDrm] = useState(false);
  const [expandedDrmRow, setExpandedDrmRow] = useState<number | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchBooks();
  }, [searchQuery]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        size: 1000,
        page: 0
      };

      if (searchQuery) {
        params.documentName = searchQuery;
      }

      const response = await apiService.get<BooksApiResponse>('/api/v1/documents', { params });
      console.log(response);
      if (response.data?.data) {
        setBooks(response.data.data.content);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };

  const handleViewDrmKeys = async (digitalDocumentId: number | undefined) => {
    if (!digitalDocumentId) return;
    setLoadingDrm(true);
    setDrmData(null);
    setExpandedDrmRow(null);
    try {
      const response = await apiService.get<DrmApiResponse>(`/api/v1/drm/${digitalDocumentId}/uploads`);
      if (response.data?.success && response.data?.data) {
        setDrmData(response.data.data);
        setOpenDrmDialog(true);
      }
    } catch (error) {
      console.error('Error fetching DRM data:', error);
      // Optionally show an error message to the user
    } finally {
      setLoadingDrm(false);
    }
  };

  const handleRevokeKey = async (uploadId: number) => {
    try {
      await apiService.post(`/api/v1/drm/revoke/${uploadId}`);
      if (drmData?.digitalDocumentId) {
        handleViewDrmKeys(drmData.digitalDocumentId);
      }
    } catch (error) {
      console.error('Error revoking key:', error);
    }
  };

  const handleRenewKey = async (uploadId: number) => {
    try {
      await apiService.post(`/api/v1/drm/renew-key/${uploadId}`);
      if (drmData?.digitalDocumentId) {
        handleViewDrmKeys(drmData.digitalDocumentId);
      }
    } catch (error) {
      console.error('Error renewing key:', error);
    }
  };

  const handleDrmRowClick = (uploadId: number) => {
    setExpandedDrmRow(expandedDrmRow === uploadId ? null : uploadId);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PHYSICAL':
        return 'primary';
      case 'DIGITAL':
        return 'secondary';
      case 'BOTH':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setOpenDialog(true);
  };

  const handleDelete = async (bookId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sách này?')) {
      try {
        await apiService.delete(`/api/v1/documents/${bookId}`);
        fetchBooks();
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  const filteredBooks = selectedCategory === 'ALL'
    ? books
    : books.filter(book => book.documentCategory === selectedCategory);

  const paginatedBooks = filteredBooks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box display="flex">
      <Sidebar />
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
              Quản lý sách
            </Typography>

            {/* Search and Filter Bar */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Tìm kiếm sách..."
                value={searchQuery}
                onChange={handleSearch}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '15px',
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Loại sách</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Loại sách"
                  onChange={handleCategoryChange}
                  sx={{
                    borderRadius: '15px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderRadius: '15px',
                    }
                  }}
                >
                  <MenuItem value="ALL">Tất cả</MenuItem>
                  <MenuItem value="PHYSICAL">Sách vật lý</MenuItem>
                  <MenuItem value="DIGITAL">Sách số</MenuItem>
                  <MenuItem value="BOTH">Cả hai</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ 
                  minWidth: 150,
                  borderRadius: '15px',
                  textTransform: 'none'
                }}
              >
                Thêm sách
              </Button>
            </Box>

            {/* Books Table */}
            <TableContainer component={Paper} sx={{ borderRadius: '15px', overflow: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ borderRadius: '15px 0 0 0' }}>Tên sách</TableCell>
                    <TableCell>Tác giả</TableCell>
                    <TableCell>Nhà xuất bản</TableCell>
                    <TableCell>Loại sách</TableCell>
                    <TableCell>Danh mục</TableCell>
                    <TableCell>Khóa học</TableCell>
                    <TableCell>Số lượng</TableCell>
                    <TableCell sx={{ borderRadius: '0 15px 0 0' }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedBooks.map((book) => (
                    <TableRow key={book.documentId}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {book.coverImage && (
                            <img
                              src={book.coverImage}
                              alt={book.documentName}
                              style={{ width: 40, height: 60, objectFit: 'cover' }}
                            />
                          )}
                          {book.documentName}
                        </Box>
                      </TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.documentCategory === 'DIGITAL' ? '-' : book.publisher}</TableCell>
                      <TableCell>
                        <Chip
                          label={book.documentCategory}
                          color={getCategoryColor(book.documentCategory)}
                          size="small"
                          sx={{ borderRadius: '15px' }}
                        />
                      </TableCell>
                      <TableCell>
                        {book.documentTypes.map(type => (
                          <Chip
                            key={type.documentTypeId}
                            label={type.typeName}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5, borderRadius: '15px' }}
                          />
                        ))}
                      </TableCell>
                      <TableCell>
                        {book.courses.map(course => (
                          <Chip
                            key={course.courseId}
                            label={course.courseName}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5, borderRadius: '15px' }}
                          />
                        ))}
                      </TableCell>
                      <TableCell>
                        {book.documentCategory === 'DIGITAL' ? (
                          '-'
                        ) : book.physicalDocument ? (
                          `${book.physicalDocument.availableCopies}/${book.physicalDocument.quantity}`
                        ) : (
                          book.digitalDocument?.uploads.length || 0
                        )}
                      </TableCell>
                      <TableCell>
                        {/* Key Icon Button */}
                        <IconButton
                          color="primary"
                          onClick={() => handleViewDrmKeys(book.digitalDocument?.digitalDocumentId)}
                          disabled={(!book.digitalDocument) || loadingDrm}
                          title="View DRM Keys"
                          sx={{ borderRadius: '15px' }}
                        >
                          <KeyIcon />
                        </IconButton>
                        {/* Delete Button */}
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(book.documentId)}
                          sx={{ borderRadius: '15px' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <TablePagination
                component="div"
                count={filteredBooks.length}
                page={page}
                onPageChange={(_e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={e => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Số hàng mỗi trang"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên ${count}`}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Edit Dialog (Keep this for future edit functionality if needed) */}
      {/* <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedBook ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
        </DialogTitle>
        <DialogContent>
          {/* Add your form fields here */}
      {/* </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" color="primary">
            Lưu
          </Button>
        </DialogActions>
      </Dialog> */}

      {/* DRM Keys Dialog */}
      <Dialog
        open={openDrmDialog}
        onClose={() => setOpenDrmDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '15px',
          }
        }}
      >
        <DialogTitle>Thông tin DRM và Key</DialogTitle>
        <DialogContent>
          {drmData ? (
            <TableContainer component={Paper} sx={{ borderRadius: '15px', overflow: 'hidden' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>File Name</TableCell>
                    <TableCell>Content Key</TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {drmData.uploads.map((upload) => (
                    <TableRow
                      key={upload.uploadId}
                      onClick={() => handleDrmRowClick(upload.uploadId)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: '#f5f5f5' }
                      }}
                    >
                      <TableCell sx={{ maxWidth: 400, wordBreak: 'break-all' }}>
                        {upload.fileName}
                      </TableCell>
                      <TableCell>
                        {upload.key && upload.key.contentKey ? 'Có' : 'Không có'}
                      </TableCell>
                      <TableCell>{upload.key && upload.key.active ? 'Yes' : 'No'}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<BlockIcon />}
                            onClick={() => handleRevokeKey(upload.uploadId)}
                            disabled={!(upload.key && upload.key.active)}
                            sx={{ borderRadius: '8px', textTransform: 'none' }}
                          >
                            Revoke
                          </Button>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<AutorenewIcon />}
                            onClick={() => handleRenewKey(upload.uploadId)}
                            sx={{ borderRadius: '8px', textTransform: 'none' }}
                          >
                            Renew
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>Không có dữ liệu DRM.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDrmDialog(false)}
            sx={{ 
              borderRadius: '15px',
              textTransform: 'none'
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
