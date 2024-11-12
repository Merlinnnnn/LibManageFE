import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import { styled } from '@mui/system';

interface Book {
  documentId: number;
  documentName: string;
  coverImage?: string;
}

interface BookCardProps {
  book: Book;
  onViewDocument: () => void;
}

const BookCardContainer = styled(Card)(({ theme }) => ({
  flex: '0 0 auto',
  width: '200px',
  height: '400px', 
  marginRight: '20px',
  borderRadius: '10px',
  backgroundColor: theme.palette.background.paper,
  transition: 'transform 0.3s',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between', 
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const BookCover = styled('img')({
  width: '100%',
  height: '250px', 
  objectFit: 'cover',
  borderRadius: '10px 10px 0 0',
});

const BookInfo = styled(CardContent)({
  padding: '10px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end',
  flexGrow: 1, 
});

const BookTitle = styled(Typography)({
  fontSize: '1.1em',
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: '10px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2, 
  WebkitBoxOrient: 'vertical',
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
        src={book.coverImage || 'https://via.placeholder.com/200x250'}
        alt='Image not found'
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
