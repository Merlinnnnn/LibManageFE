import React, { useEffect, useState, MouseEvent } from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { styled } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import apiService from '../../untils/api';

interface Book {
  documentId: number;
  documentName: string;
  isbn: string;
  author: string;
  publisher: string;
  cover?: string;
}

interface ApiResponse {
  data: {
    result: {
      content: Book[];
    };
  };
}

const Container = styled(Box)(({ theme }) => ({
  padding: '20px',
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  fontFamily: 'Arial, sans-serif',
}));

const BookSlider = styled(Box)({
  display: 'flex',
  overflowX: 'auto',
  scrollBehavior: 'smooth',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  cursor: 'grab',
});

const BookCard = styled(Card)(({ theme }) => ({
  flex: '0 0 auto',
  width: '200px',
  marginRight: '20px',
  borderRadius: '10px',
  backgroundColor: theme.palette.background.paper,
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const BookCover = styled('img')({
  width: '100%',
  height: '300px',
  objectFit: 'cover',
  borderRadius: '10px 10px 0 0',
});

const BookInfo = styled(CardContent)({
  padding: '15px',
});

const BookTitle = styled(Typography)({
  fontSize: '1.1em',
  fontWeight: 'bold',
  margin: 0,
});

const ViewMoreButton = styled(Button)(({ theme }) => ({
  marginTop: '20px',
  padding: '10px 20px',
  backgroundColor: theme.palette.mode === 'light' ? '#444' : '#666',
  color: theme.palette.getContrastText(theme.palette.mode === 'light' ? '#444' : '#666'),
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light' ? '#666' : '#888',
  },
}));

const TrendingBooks: React.FC = () => {
  const theme = useTheme();
  const [books, setBooks] = useState<Book[]>([]);

  const fetchAllBooks = async () => {
    try {
      const response: ApiResponse = await apiService.get(`/api/v1/documents?size=20`);
      console.log('response', response);
      if (response.data && response.data.result && response.data.result.content) {
        setBooks(response.data.result.content);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  // Handler for drag functionality
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const slider = e.currentTarget as HTMLDivElement & { isDown?: boolean; startX?: number; scrollLeft?: number };
    slider.isDown = true;
    slider.startX = e.pageX - slider.offsetLeft;
    slider.scrollLeft = slider.scrollLeft;
  };

  const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    const slider = e.currentTarget as HTMLDivElement & { isDown?: boolean };
    slider.isDown = false;
  };

  const handleMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    const slider = e.currentTarget as HTMLDivElement & { isDown?: boolean };
    slider.isDown = false;
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const slider = e.currentTarget as HTMLDivElement & { isDown?: boolean; startX?: number; scrollLeft?: number };
    if (!slider.isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - (slider.startX || 0)) * 2; // Adjust scroll speed
    slider.scrollLeft = (slider.scrollLeft || 0) - walk;
  };

  useEffect(() => {
    fetchAllBooks();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Trending Books</Typography>
      <BookSlider
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {books.map((book) => (
          <BookCard key={book.documentId}>
            <BookCover
              src={book.cover || 'https://via.placeholder.com/200x300'}
              alt={book.documentName}
            />
            <BookInfo>
              <BookTitle>{book.documentName}</BookTitle>
            </BookInfo>
          </BookCard>
        ))}
      </BookSlider>
      <ViewMoreButton variant="contained">View More</ViewMoreButton>
    </Container>
  );
};

export default TrendingBooks;