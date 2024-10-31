// TrendingBooks.tsx
import React, { useEffect, useState, MouseEvent } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { styled } from '@mui/system';
import apiService from '../../untils/api';
import BookCard from './BookCard';
import BookDetail from './BookDetail'; // Import BookDetail component

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

const TrendingBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

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

  const handleViewDocument = (id: string) => {
    setSelectedBookId(id);
  };

  const handleCloseDialog = () => {
    setSelectedBookId(null);
  };

  useEffect(() => {
    fetchAllBooks();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Trending Books</Typography>
      <BookSlider>
        {books.map((book) => (
          <BookCard 
            key={book.documentId} 
            book={book} 
            onViewDocument={() => handleViewDocument(book.documentId.toString())} 
          />
        ))}
      </BookSlider>

      {/* Hiển thị BookDetail dưới dạng Dialog */}
      {selectedBookId && (
        <BookDetail id={selectedBookId} open={!!selectedBookId} onClose={handleCloseDialog} />
      )}
    </Container>
  );
};

export default TrendingBooks;
