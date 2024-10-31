// TrendingBooks.tsx
import React, { useEffect, useState, MouseEvent } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { styled } from '@mui/system';
import apiService from '../../untils/api';
import BookCard from './BookCard';

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

const BookList: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);

  const fetchAllBooks = async () => {
    try {
      const response: ApiResponse = await apiService.get(`/api/v1/documents?size=20`);
      if (response.data && response.data.result && response.data.result.content) {
        setBooks(response.data.result.content);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  useEffect(() => {
    fetchAllBooks();
  }, []);

  // Drag functionality for horizontal scrolling
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
          <BookCard key={book.documentId} book={book} />
        ))}
      </BookSlider>
      <Button variant="contained" sx={{ marginTop: '20px' }}>View More</Button>
    </Container>
  );
};

export default BookList;
