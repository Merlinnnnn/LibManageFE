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
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Key as KeyIcon,
  Delete as DeleteIcon,
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
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const booksPerPage = 10;

  const [openDrmDialog, setOpenDrmDialog] = useState(false);
  const [drmData, setDrmData] = useState<DrmApiResponse['data'] | null>(null);
  const [loadingDrm, setLoadingDrm] = useState(false);
  const [expandedDrmRow, setExpandedDrmRow] = useState<number | null>(null);

  useEffect(() => {
    fetchBooks();
  }, [currentPage, searchQuery, selectedCategory]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        size: booksPerPage,
        page: currentPage
      };

      if (searchQuery) {
        params.documentName = searchQuery;
      }
      if (selectedCategory !== 'ALL') {
        params.documentCategory = selectedCategory;
      }

      const response = await apiService.get<BooksApiResponse>('/api/v1/documents', { params });
      console.log(response);
      if (response.data?.data) {
        setBooks(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
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

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value - 1);
  };

  const handleViewDrmKeys = async (documentId: number) => {
    setLoadingDrm(true);
    setDrmData(null);
    setExpandedDrmRow(null);
    try {
      const response = await apiService.get<DrmApiResponse>(`/api/v1/drm/${documentId}/uploads`);
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

  const handleToggleKeyStatus = (uploadId: number) => {
    console.log(1);
    // Future implementation: call API to toggle key status
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
                  {books.map((book) => (
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
                      <TableCell>{book.publisher}</TableCell>
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
                        {book.physicalDocument ? (
                          `${book.physicalDocument.availableCopies}/${book.physicalDocument.quantity}`
                        ) : (
                          book.digitalDocument?.uploads.length || 0
                        )}
                      </TableCell>
                      <TableCell>
                        {/* Key Icon Button */}
                        <IconButton
                          color="primary"
                          onClick={() => handleViewDrmKeys(book.documentId)}
                          disabled={book.documentCategory !== 'DIGITAL' && book.documentCategory !== 'BOTH' || loadingDrm}
                          title="View DRM Keys"
                          sx={{ borderRadius: '15px' }}
                        >
                          {loadingDrm && drmData?.digitalDocumentId === book.documentId ? <CircularProgress size={20} /> : <KeyIcon />}
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

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage + 1}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
                size="large"
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: '15px',
                  }
                }}
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
                    <TableCell>Upload ID</TableCell>
                    <TableCell>File Path</TableCell>
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
                      <TableCell>{upload.fileName}</TableCell>
                      <TableCell>{upload.uploadId}</TableCell>
                      <TableCell>{upload.filePath}</TableCell>
                      <TableCell sx={{ wordBreak: 'break-all' }}>
                        {expandedDrmRow === upload.uploadId ? (
                          upload.key.contentKey
                        ) : (
                          <Tooltip title={upload.key.contentKey} placement="top">
                            <span>{upload.key.contentKey.substring(0, TRUNCATE_LENGTH) + (upload.key.contentKey.length > TRUNCATE_LENGTH ? '...' : '')}</span>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>{upload.key.active ? 'Yes' : 'No'}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={upload.key.active}
                          onChange={() => handleToggleKeyStatus(upload.uploadId)}
                          inputProps={{ 'aria-label': 'toggle key status' }}
                          sx={{
                            '& .MuiSwitch-switchBase': {
                              borderRadius: '15px',
                            },
                            '& .MuiSwitch-thumb': {
                              borderRadius: '15px',
                            }
                          }}
                        />
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
