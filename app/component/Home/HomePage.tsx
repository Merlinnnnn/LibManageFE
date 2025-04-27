import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  useTheme, 
  styled,
  Theme
} from '@mui/material';
import Header from './Header';
import { keyframes } from '@emotion/react';

// Type definitions
interface LibraryServiceCardProps {
  title: string;
  description: string;
  href: string;
  bgColor?: string;
  icon: React.ReactNode;
}

interface CollectionCardProps {
  title: string;
  subtitle: string;
  href: string;
  iconBgColor?: string;
}

// Images (you can replace with your actual image paths)
const cardImages = {
  libraryCard: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1476&q=80',
  borrowMaterials: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1453&q=80',
  researchHelp: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1473&q=80'
};

// Styled components
const HeroSection = styled(Box)(({ theme }: { theme: Theme }) => ({
  position: 'relative',
  minHeight: '500px',
  display: 'flex',
  alignItems: 'center',
  backgroundImage: 'url(https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  marginTop: '-64px',
  paddingTop: '128px',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
}));

const ServiceCardContainer = styled('a')<{bgimage?: string}>(({ theme, bgimage }) => ({
  position: 'relative',
  borderRadius: '8px',
  padding: theme.spacing(4),
  height: '100%',
  minHeight: '200px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  overflow: 'hidden',
  textDecoration: 'none',
  color: theme.palette.common.white,
  backgroundImage: bgimage ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${bgimage})` : 'none',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
    '&::before': {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
    transition: 'all 0.3s ease',
  },
}));

const ServiceCardContent = styled(Box)({
  position: 'relative',
  zIndex: 2,
});

const SectionTitle = styled(Typography)(({ theme }: { theme: Theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(4),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: '60px',
    height: '3px',
    backgroundColor: theme.palette.secondary.main,
  },
}));

// Icons (you can replace with your actual icons)
const LibraryCardIcon = () => (
  <Box sx={{ 
    width: 48, 
    height: 48, 
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    mb: 2
  }}>
    <Typography variant="h5">📚</Typography>
  </Box>
);

const BorrowIcon = () => (
  <Box sx={{ 
    width: 48, 
    height: 48, 
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    mb: 2
  }}>
    <Typography variant="h5">🔖</Typography>
  </Box>
);

const ResearchIcon = () => (
  <Box sx={{ 
    width: 48, 
    height: 48, 
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    mb: 2
  }}>
    <Typography variant="h5">🔍</Typography>
  </Box>
);

// Component definitions
const LibraryServiceCard: React.FC<LibraryServiceCardProps> = ({ 
  title, 
  description, 
  href,
  bgColor,
  icon
}) => {
  return (
    <ServiceCardContainer href={href} bgimage={bgColor}>
      <ServiceCardContent>
        {icon}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {description}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Click to learn more →
        </Typography>
      </ServiceCardContent>
    </ServiceCardContainer>
  );
};

const CollectionCard: React.FC<CollectionCardProps> = ({ 
  title, 
  subtitle, 
  href, 
  iconBgColor 
}) => {
  const theme = useTheme();

  return (
    <ServiceCardContainer href={href}>
      <ServiceCardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            width: 80, 
            height: 80, 
            backgroundColor: iconBgColor || theme.palette.grey[200], 
            mr: 2,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {title.split(' ').map(word => word[0]).join('')}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
            <Typography variant="body2">{subtitle}</Typography>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right' }}>
          Explore collection →
        </Typography>
      </ServiceCardContent>
    </ServiceCardContainer>
  );
};

// Main component
const Home: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      <Header />
      
      <HeroSection>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 2 }}>
            <Grid item xs={12} md={8}>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  lineHeight: 1.3,
                  mb: 3,
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                Welcome to Our Digital Library
              </Typography>
              <Typography 
                variant="h5" 
                component="p" 
                gutterBottom 
                sx={{ 
                  mb: 4,
                  opacity: 0.9,
                  lineHeight: 1.6,
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                Access thousands of ebooks, audiobooks and academic resources. 
                All you need is your library account.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                href="/bookshelf"
                sx={{ 
                  backgroundColor: 'secondary.main',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  borderRadius: '4px',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'secondary.dark',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Explore Collections
              </Button>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* Using the Library Section */}
      <Box sx={{ py: 8, backgroundColor: theme.palette.background.default }}>
        <Container maxWidth="lg">
          <SectionTitle variant="h4" sx={{ color: 'text.primary' }}>Using the Library</SectionTitle>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <LibraryServiceCard 
                title="Get a Library Card"
                description="Register online or visit in person to get full access to all digital resources."
                href="/register"
                bgColor={cardImages.libraryCard}
                icon={<LibraryCardIcon />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <LibraryServiceCard 
                title="Borrow Materials"
                description="Check out ebooks, audiobooks, and other digital materials for free."
                href="/how-to-borrow"
                bgColor={cardImages.borrowMaterials}
                icon={<BorrowIcon />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <LibraryServiceCard 
                title="Research Help"
                description="Get assistance from our librarians for your academic research needs."
                href="/research-help"
                bgColor={cardImages.researchHelp}
                icon={<ResearchIcon />}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Collections */}
      <Box sx={{ py: 8, backgroundColor: theme.palette.background.paper }}>
        <Container maxWidth="lg">
          <SectionTitle variant="h4" sx={{ color: 'text.primary' }}>Featured Collections</SectionTitle>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <CollectionCard 
                title="Academic Journals"
                subtitle="Latest research publications"
                href="/journals"
                iconBgColor={theme.palette.primary.main}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CollectionCard 
                title="Popular Titles"
                subtitle="Bestsellers and new releases"
                href="/popular-books"
                iconBgColor={theme.palette.secondary.main}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;