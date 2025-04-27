import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Chip,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

interface DocumentType {
  id: number;
  name: string;
}

interface Course {
  id: number;
  name: string;
}

const UploadVirtualBook: React.FC = () => {
  const [documentName, setDocumentName] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDocumentType, setSelectedDocumentType] = useState<number | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  // Fetch document types and courses from API
  useEffect(() => {
    // Mock API calls - replace with actual API calls
    const fetchDocumentTypes = async () => {
      // Replace with actual API call
      const mockTypes: DocumentType[] = [
        { id: 1, name: 'Textbook' },
        { id: 2, name: 'Research Paper' },
        { id: 3, name: 'Novel' },
        { id: 4, name: 'Reference Magazine' }
      ];
      setDocumentTypes(mockTypes);
    };

    const fetchCourses = async () => {
      // Replace with actual API call
      const mockCourses: Course[] = [
        { id: 1, name: 'Computer Science 101' },
        { id: 2, name: 'Data Structures' },
        { id: 3, name: 'Algorithms' },
        { id: 4, name: 'Web Development' },
        { id: 5, name: 'Machine Learning' }
      ];
      setCourses(mockCourses);
    };

    fetchDocumentTypes();
    fetchCourses();
  }, []);

  const handleCourseToggle = (courseId: number) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({
      documentName,
      author,
      publisher,
      description,
      selectedDocumentType,
      selectedCourses,
      coverImage,
      documentFile
    });
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Upload Virtual Book
      </Typography>

      <Paper sx={{ padding: 3 }} elevation={3}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Document Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Document Name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                required
              />
            </Grid>

            {/* Author */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </Grid>

            {/* Publisher */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Publisher"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
              />
            </Grid>

            {/* Document Types */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Document Types</InputLabel>
                <Select
                  value={selectedDocumentType || ''}
                  onChange={(e) => setSelectedDocumentType(Number(e.target.value))}
                  label="Document Types"
                  required
                >
                  {documentTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Related Courses */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Related Courses
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {courses.map((course) => (
                  <Chip
                    key={course.id}
                    label={course.name}
                    color={selectedCourses.includes(course.id) ? 'primary' : 'default'}
                    onClick={() => handleCourseToggle(course.id)}
                    variant={selectedCourses.includes(course.id) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>

            {/* Cover Image Upload */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Cover Image
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadFileIcon />}
              >
                Select Cover Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleCoverImageChange}
                />
              </Button>
              {coverImage && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected: {coverImage.name}
                </Typography>
              )}
            </Grid>

            {/* Document File Upload */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                File Upload (PDF, Word, MP4)
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadFileIcon />}
              >
                Select Document File
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx,.mp4"
                  onChange={handleDocumentFileChange}
                />
              </Button>
              {documentFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected: {documentFile.name}
                </Typography>
              )}
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Supported formats: PDF, Word (.doc, .docx), MP4 video
              </Typography>
            </Grid>

            {/* Confirmation Checkbox */}
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox required />}
                label="I confirm that I have the rights to upload this document"
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
              >
                Upload Document
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default UploadVirtualBook;