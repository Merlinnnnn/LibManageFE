// BookCard.tsx
import React, { useState } from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import { styled } from '@mui/system';
import BookDetail from './BookDetail';

interface Book {
  documentId: number;
  documentName: string;
  cover?: string;
}

interface BookCardProps {
  book: Book;
  onViewDocument: () => void; // Thêm thuộc tính onViewDocument vào props
}

const BookCardContainer = styled(Card)(({ theme }) => ({
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
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const BookTitle = styled(Typography)({
  fontSize: '1.1em',
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: '10px',
});

const ViewDocumentButton = styled(Button)({
  width: '100%',
  backgroundColor: '#1976d2',
  color: '#fff',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  '&:hover': {
    backgroundColor: '#1565c0',
  },
});

const BookCard: React.FC<BookCardProps> = ({ book, onViewDocument }) => {
  return (
    <BookCardContainer>
      <BookCover
        src={book.cover || 'https://via.placeholder.com/200x300'}
        alt={book.documentName}
      />
      <BookInfo>
        <BookTitle>{book.documentName}</BookTitle>
        <ViewDocumentButton variant="contained" onClick={onViewDocument}>
          View Document
        </ViewDocumentButton>
      </BookInfo>
    </BookCardContainer>
  );
};

export default BookCard;
