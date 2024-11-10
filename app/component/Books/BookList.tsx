// TrendingBooks.tsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import apiService from '../../untils/api';
import BookCard from './BookCard';
import BookDetail from './BookDetail'; // Import BookDetail component

interface Book {
  documentId: number;
  documentName: string;
  isbn: string;
  author: string;
  publisher: string;
  documentLink: string;
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

const BookSliderContainer = styled(Box)({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
});

const BookSlider = styled(Box)({
  display: 'flex',
  overflowX: 'auto',
  scrollBehavior: 'smooth',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

const ArrowButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 2,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const LeftArrowButton = styled(ArrowButton)({
  left: '10px',
});

const RightArrowButton = styled(ArrowButton)({
  right: '10px',
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

  const handleViewDocument = (id: string, imgLink: string) => {
    setSelectedBookId(id);
    console.log(imgLink);
  };

  const handleCloseDialog = () => {
    setSelectedBookId(null);
  };

  const scrollLeft = () => {
    const slider = document.getElementById('book-slider');
    if (slider) {
      slider.scrollBy({ left: -500, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const slider = document.getElementById('book-slider');
    if (slider) {
      slider.scrollBy({ left: 500, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetchAllBooks();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Trending Books</Typography>
      <BookSliderContainer>
        <LeftArrowButton onClick={scrollLeft}>
          <ArrowBackIosIcon />
        </LeftArrowButton>
        <BookSlider id="book-slider">
          {books.map((book) => (
            <BookCard 
              key={book.documentId} 
              book={book} 
              onViewDocument={() => handleViewDocument(book.documentId.toString(), book.documentLink)} 
            />
          ))}
        </BookSlider>
        <RightArrowButton onClick={scrollRight}>
          <ArrowForwardIosIcon />
        </RightArrowButton>
      </BookSliderContainer>

      {selectedBookId && (
        <BookDetail id={selectedBookId} open={!!selectedBookId} onClose={handleCloseDialog} />
      )}
    </Container>
  );
};

export default TrendingBooks;
