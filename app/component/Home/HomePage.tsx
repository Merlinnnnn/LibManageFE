import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import Header from './Header';
import { useTheme } from '@mui/material/styles';
import TrendingBooks from './ListBooks';
import BookList from '../Books/BookList';


export default function Home() {
  const theme = useTheme();

  return (
    <Box>
      <Header />
      <Box sx={{ height: '100vh', background: theme.palette.background.default, padding: '20px' }}>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '80%' }}>
            <Box sx={{ width: '50%', paddingRight: '20px', color: theme.palette.text.primary, textAlign: 'center' }}>
              <Typography variant="h3" component="h1" gutterBottom>
                Free ebooks, audiobooks & magazines from your library
              </Typography>
              <Typography variant="body1" gutterBottom>
                All you need is a public library card or access through your workplace or university. Always free - no fees or subscriptions.
              </Typography>
              <Button variant="contained" sx={{ backgroundColor: '#0077b6', color: 'white', marginTop: '20px' }}>
                Get started with a books today
              </Button>
            </Box>
            <Box sx={{ width: '50%', boxShadow: 'none' }}>
              <img
                height="200"
                src="https://images.contentstack.io/v3/assets/blt3d151d94546d0edd/blt63e567004616c5bf/66d873f62504007b40f52645/LibbyDevices2024.png"
                alt="Libby App Preview"
                style={{ border: 'none', boxShadow: 'none', width: '100%' }}
              />
            </Box>
          </Box>
        </Box>
        <Box sx={{ width: '100%' }}>
          <BookList />
        </Box>
      </Box>
    </Box>
  );
}
