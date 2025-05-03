import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
    Chip,
    Avatar,
    CircularProgress,
    InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/material/styles';
import apiService from '@/app/untils/api';

interface DocumentType {
  id: number;
  name: string;
}

interface Course {
  id: number;
  name: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  uploadDate: string;
  fileSize: string;
  documentType: string;
  courses: string[];
  isPublic: boolean;
  wordFile?: string;
  pdfFile?: string;
  mp4File?: string;
}

interface BookFormData {
    title: string;
    author: string;
    description: string;
    documentTypeIds: number[];
    courseIds: number[];
}



const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});
interface UploadBookDialogProps {
  open: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  documentTypes: DocumentType[];
  courses: Course[];
}
const UploadBookDialog: React.FC<UploadBookDialogProps> = ({ 
  open, 
  onClose, 
  onUploadSuccess,
  documentTypes, 
  courses 
}) => {
    const [book, setBook] = useState<BookFormData>({
        title: '',
        author: '',
        description: '',
        documentTypeIds: [],
        courseIds: []
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileError, setFileError] = useState<string>('');
    const [pdfError, setPdfError] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBook(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setFileError('');
          setSelectedFile(file);
          setPreview(URL.createObjectURL(file));
      }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const pdfFile = e.target.files[0];
        setPdfError('');
        setSelectedPdfFile(pdfFile);
    }
};
    const handleTagToggle = (tagId: number) => {
        setBook(prev => ({
            ...prev,
            documentTypeIds: prev.documentTypeIds.includes(tagId)
                ? prev.documentTypeIds.filter(id => id !== tagId)
                : [...prev.documentTypeIds, tagId]
        }));
    };

    const handleCourseToggle = (courseId: number) => {
        setBook(prev => ({
            ...prev,
            courseIds: prev.courseIds.includes(courseId)
                ? prev.courseIds.filter(id => id !== courseId)
                : [...prev.courseIds, courseId]
        }));
    };

    const handleSubmit = async () => {
        // Validate required fields
        if (!selectedFile) {
            setFileError('Cover image is required');
            return;
        }
        if (!selectedPdfFile) {
            setPdfError('PDF file is required');
            return;
        }
        if (!book.title.trim()) {
            return;
        }
        if (!book.author.trim()) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            const formData = new FormData();
            formData.append('documentName', book.title);
            formData.append('author', book.author);
            formData.append('description', book.description);
            if (selectedFile) formData.append('image', selectedFile);
            if (selectedPdfFile) formData.append('files', selectedPdfFile);
            formData.append('publisher', 'abc');
            
            book.documentTypeIds.forEach(id => 
                formData.append('documentTypeIds', id.toString())
            );
            
            book.courseIds.forEach(id => 
                formData.append('courseIds', id.toString())
            );
            const res = await apiService.post('/api/v1/digital-documents', formData);
            console.log('res', res);
            if(res.status === 200){
                onUploadSuccess();
            }
            handleClose();
        } catch (error) {
            console.error('Error adding book:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setBook({
            title: '',
            author: '',
            description: '',
            documentTypeIds: [],
            courseIds: []
        });
        setSelectedFile(null);
        setSelectedPdfFile(null);
        setPreview(null);
        setFileError('');
        setPdfError('');
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '12px',
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f5f5f5',
                borderBottom: '1px solid #e0e0e0',
                padding: '16px 24px'
            }}>
                <Typography variant="h6" fontWeight="bold">Add New Book</Typography>
                <IconButton onClick={handleClose} edge="end">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ padding: '24px' }}>
                <Box display="flex" gap={4}>
                    {/* Left Column - Image and PDF Upload */}
                    <Box width="40%">
                        <Box mb={3}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Cover Image *
                            </Typography>
                            <Box
                                component="label"
                                htmlFor="cover-image-upload"
                                sx={{
                                    display: 'block',
                                    border: fileError ? '2px dashed #f44336' : '2px dashed #e0e0e0',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    textAlign: 'center',
                                    backgroundColor: '#fafafa',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        borderColor: '#2196f3'
                                    }
                                }}
                            >
                                {preview ? (
                                    <Avatar
                                        src={preview}
                                        alt="Book Cover Preview"
                                        sx={{ width: 150, height: 200, margin: '0 auto' }}
                                        variant="rounded"
                                    />
                                ) : (
                                    <>
                                        <CloudUploadIcon fontSize="large" color="action" sx={{ mb: 1 }} />
                                        <Typography variant="body2">Click to upload cover image</Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            *.jpeg, *.jpg, *.png (max 100KB)
                                        </Typography>
                                    </>
                                )}
                                <VisuallyHiddenInput
                                    id="cover-image-upload"
                                    type="file"
                                    accept="image/jpeg, image/jpg, image/png"
                                    onChange={handleFileChange}
                                />
                            </Box>
                            {fileError && (
                                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                                    {fileError}
                                </Typography>
                            )}
                        </Box>

                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                PDF File *
                            </Typography>
                            <Button
                                component="label"
                                variant="outlined"
                                fullWidth
                                startIcon={<DescriptionIcon />}
                                sx={{
                                    height: '56px',
                                    justifyContent: 'flex-start',
                                    textTransform: 'none',
                                    borderColor: pdfError ? '#f44336' : undefined
                                }}
                            >
                                {selectedPdfFile ? (
                                    <Box display="flex" alignItems="center" width="100%">
                                        <PictureAsPdfIcon color="primary" sx={{ mr: 1 }} />
                                        <Typography noWrap flexGrow={1} textAlign="left">
                                            {selectedPdfFile.name}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPdfFile(null);
                                            }}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ) : (
                                    'Upload PDF (max 10MB)'
                                )}
                                <VisuallyHiddenInput
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handlePdfChange}
                                />
                            </Button>
                            {pdfError && (
                                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                                    {pdfError}
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {/* Right Column - Form Fields */}
                    <Box width="60%">
                        <TextField
                            fullWidth
                            label="Title *"
                            name="title"
                            value={book.title}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            required
                            error={!book.title.trim()}
                            helperText={!book.title.trim() ? 'Title is required' : ''}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <DescriptionIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Author *"
                            name="author"
                            value={book.author}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            required
                            error={!book.author.trim()}
                            helperText={!book.author.trim() ? 'Author is required' : ''}
                        />

                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={book.description}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            multiline
                            rows={4}
                        />

                        <Box mt={3}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Document Types
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={1}>
                                {documentTypes.map((tag) => (
                                    <Chip
                                        key={tag.id}
                                        label={tag.name}
                                        clickable
                                        color={book.documentTypeIds.includes(tag.id) ? 'primary' : 'default'}
                                        onClick={() => handleTagToggle(tag.id)}
                                        variant={book.documentTypeIds.includes(tag.id) ? 'filled' : 'outlined'}
                                        deleteIcon={<CheckCircleIcon />}
                                        onDelete={book.documentTypeIds.includes(tag.id) ? () => {} : undefined}
                                    />
                                ))}
                            </Box>
                        </Box>

                        <Box mt={3}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Related Courses
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={1}>
                                {courses.map((course) => (
                                    <Chip
                                        key={course.id}
                                        label={course.name}
                                        clickable
                                        color={book.courseIds.includes(course.id) ? 'primary' : 'default'}
                                        onClick={() => handleCourseToggle(course.id)}
                                        variant={book.courseIds.includes(course.id) ? 'filled' : 'outlined'}
                                        deleteIcon={<CheckCircleIcon />}
                                        onDelete={book.courseIds.includes(course.id) ? () => {} : undefined}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ 
                padding: '16px 24px', 
                borderTop: '1px solid #e0e0e0',
                justifyContent: 'space-between'
            }}>
                <Typography variant="caption" color="textSecondary">
                    * Required fields
                </Typography>
                <Box>
                    <Button 
                        onClick={handleClose} 
                        color="inherit" 
                        sx={{ mr: 2 }}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        color="primary"
                        variant="contained"
                        disabled={isSubmitting || !selectedFile || !selectedPdfFile || !book.title.trim() || !book.author.trim()}
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
                    >
                        {isSubmitting ? 'Adding...' : 'Add Book'}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default UploadBookDialog;