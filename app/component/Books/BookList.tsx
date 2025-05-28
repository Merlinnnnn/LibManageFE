// TrendingBooks.tsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
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
    content: Book[];
  };
}


const Container = styled(Box)(({ theme }) => ({
  padding: '20px',
  backgroundColor: '#9c9997',
  color: theme.palette.text.primary,
  borderRadius: '20px'
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
  gap: '20px'
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
      const response = await apiService.get<ApiResponse>(`/api/v1/documents?size=20`);
      const content = response.data.data.content;

      if (Array.isArray(content) && content.length > 0) {
        setBooks(content);
      } else {
        console.log('No books found:', response);
        setBooks([]);
      }
    } catch (error) {
      console.log('Error fetching books:', error);
      setBooks([]);
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
    <Container id='book-list' >
      <Typography variant="h4" gutterBottom>Sách đề xuất</Typography>
      {books.length > 0 ? (
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
      ) : (
        <Typography variant="body1">Không có sách nào để đề xuất.</Typography>
      )}

      {selectedBookId && (
        <BookDetail id={selectedBookId} open={!!selectedBookId} onClose={handleCloseDialog} />
      )}
    </Container>
  );
};

export default TrendingBooks;
