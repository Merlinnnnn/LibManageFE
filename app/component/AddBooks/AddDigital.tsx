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
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArticleIcon from '@mui/icons-material/Article';
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

interface SelectedFile {
    file: File;
    type: 'pdf' | 'word';
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
    const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
    const [preview, setPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileError, setFileError] = useState<string>('');
    const [filesError, setFilesError] = useState<string>('');

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

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const newFiles: SelectedFile[] = Array.from(e.target.files)
            .map(file => {
                if (file.type === 'application/pdf') {
                    return { file, type: 'pdf' as const };
                } else if (
                    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                    file.type === 'application/msword'
                ) {
                    return { file, type: 'word' as const };
                }
                return null;
            })
            .filter((f): f is SelectedFile => f !== null);

        setFilesError('');
        setSelectedFiles(prev => [...prev, ...newFiles]);
    }
};

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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
        if (selectedFiles.length === 0) {
            setFilesError('At least one document file is required');
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
            if (selectedFile) formData.append('coverImage', selectedFile);
            
            // Append all selected files
            selectedFiles.forEach((selectedFile) => {
                formData.append('files', selectedFile.file);
            });
            
            formData.append('publisher', 'abc');
            
            book.documentTypeIds.forEach(id => 
                formData.append('documentTypeIds', id.toString())
            );
            
            book.courseIds.forEach(id => 
                formData.append('courseIds', id.toString())
            );
            const res = await apiService.post('/api/v1/digital-documents', formData);
            console.log('res', res);
            if(res.status === 201){
                onUploadSuccess();
                console.log('thêm thành công');
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
        setSelectedFiles([]);
        setPreview(null);
        setFileError('');
        setFilesError('');
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
                    borderRadius: '10px',
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
                                    borderRadius: '10px',
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
                                        sx={{ width: 150, height: 200, margin: '0 auto', borderRadius: '10px' }}
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
                                Document Files *
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
                                    borderColor: filesError ? '#f44336' : undefined,
                                    mb: 2,
                                    borderRadius: '10px'
                                }}
                            >
                                Upload Documents (PDF, Word)
                                <VisuallyHiddenInput
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    multiple
                                    onChange={handleFilesChange}
                                />
                            </Button>
                            {filesError && (
                                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                                    {filesError}
                                </Typography>
                            )}
                            {selectedFiles.length > 0 && (
                                <List sx={{ 
                                    maxHeight: '200px', 
                                    overflowY: 'auto',
                                    bgcolor: '#f5f5f5',
                                    borderRadius: '10px',
                                    p: 1
                                }}>
                                    {selectedFiles.map((selectedFile, index) => (
                                        <ListItem
                                            key={index}
                                            sx={{
                                                bgcolor: 'white',
                                                mb: 1,
                                                borderRadius: '8px',
                                                '&:last-child': {
                                                    mb: 0
                                                }
                                            }}
                                            secondaryAction={
                                                <IconButton 
                                                    edge="end" 
                                                    onClick={() => removeFile(index)}
                                                    sx={{
                                                        color: '#f44336',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(244, 67, 54, 0.08)'
                                                        }
                                                    }}
                                                >
                                                    <CloseIcon />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemIcon>
                                                {selectedFile.type === 'pdf' ? (
                                                    <PictureAsPdfIcon color="error" />
                                                ) : (
                                                    <ArticleIcon color="primary" />
                                                )}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 500,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            maxWidth: '200px'
                                                        }}
                                                    >
                                                        {selectedFile.file.name}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {selectedFile.type.toUpperCase()}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
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
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px'
                                }
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
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px'
                                }
                            }}
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
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px'
                                }
                            }}
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
                                        sx={{ borderRadius: '10px' }}
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
                                        sx={{ borderRadius: '10px' }}
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
                        sx={{ mr: 2, borderRadius: '10px' }}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        color="primary"
                        variant="contained"
                        disabled={isSubmitting || !selectedFile || selectedFiles.length === 0 || !book.title.trim() || !book.author.trim()}
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
                        sx={{ borderRadius: '10px' }}
                    >
                        {isSubmitting ? 'Adding...' : 'Add Book'}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default UploadBookDialog;