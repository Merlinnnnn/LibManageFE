import React, { useEffect } from 'react';
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
import Footer from './Footer';
import { keyframes } from '@emotion/react';
import FloatingChat from './FloatingChat';
import { useAuth } from '../Context/AuthContext';

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
  borderRadius: '15px',
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
          Nhấp để tìm hiểu thêm →
        </Typography>
      </ServiceCardContent>
    </ServiceCardContainer>
  );
};

// const CollectionCard: React.FC<CollectionCardProps> = ({ 
//   title, 
//   subtitle, 
//   href, 
//   iconBgColor 
// }) => {
//   const theme = useTheme();

//   return (
//     <ServiceCardContainer href={href}>
//       <ServiceCardContent>
//         <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//           <Box sx={{ 
//             width: 80, 
//             height: 80, 
//             backgroundColor: iconBgColor || theme.palette.grey[200], 
//             mr: 2,
//             borderRadius: '8px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             color: 'white',
//             fontWeight: 'bold'
//           }}>
//             {title.split(' ').map(word => word[0]).join('')}
//           </Box>
//           <Box>
//             <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
//             <Typography variant="body2">{subtitle}</Typography>
//           </Box>
//         </Box>
//         <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right' }}>
//           Khám phá bộ sưu tập →
//         </Typography>
//       </ServiceCardContent>
//     </ServiceCardContainer>
//   );
// };

// Main component
const Home: React.FC = () => {
  const theme = useTheme();
  const { checkTokenValidity } = useAuth();

  useEffect(() => {
    checkTokenValidity();
  }, []);

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      overflowX: 'hidden'
    }}>
      <Header />
      
      <Box sx={{ flex: 1 }}>
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
                  Chào mừng đến với Thư viện Số của chúng tôi
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
                  Truy cập hàng nghìn sách điện tử, sách nói và tài nguyên học thuật. 
                  Tất cả những gì bạn cần là tài khoản thư viện.
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
                    borderRadius: '15px',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'secondary.dark',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Khám phá tủ sách 
                </Button>
              </Grid>
            </Grid>
          </Container>
        </HeroSection>

        {/* Using the Library Section */}
        <Box sx={{ py: 8, backgroundColor: theme.palette.background.default }}>
          <Container maxWidth="lg">
            <SectionTitle variant="h4" sx={{ color: 'text.primary' }}>Sử dụng thư viện</SectionTitle>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <LibraryServiceCard 
                  title="Đăng ký thẻ thư viện"
                  description="Đăng ký trực tuyến hoặc đến trực tiếp để có quyền truy cập đầy đủ vào tất cả tài nguyên số."
                  href="/instruct/register"
                  bgColor={cardImages.libraryCard}
                  icon={<LibraryCardIcon />}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <LibraryServiceCard 
                  title="Mượn tài liệu"
                  description="Mượn sách điện tử, sách nói và các tài liệu số khác miễn phí."
                  href="/instruct/how-to-borrow"
                  bgColor={cardImages.borrowMaterials}
                  icon={<BorrowIcon />}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <LibraryServiceCard 
                  title="Hỗ trợ nghiên cứu"
                  description="Nhận hỗ trợ từ thủ thư của chúng tôi cho nhu cầu nghiên cứu học thuật của bạn."
                  href="/instruct/research-help"
                  bgColor={cardImages.researchHelp}
                  icon={<ResearchIcon />}
                />
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Featured Collections
        <Box sx={{ py: 8, backgroundColor: theme.palette.background.paper }}>
          <Container maxWidth="lg">
            <SectionTitle variant="h4" sx={{ color: 'text.primary' }}>Bộ sưu tập nổi bật</SectionTitle>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <CollectionCard 
                  title="Tạp chí học thuật"
                  subtitle="Ấn phẩm nghiên cứu mới nhất"
                  href="/journals"
                  iconBgColor={theme.palette.primary.main}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CollectionCard 
                  title="Sách phổ biến"
                  subtitle="Sách bán chạy và phát hành mới"
                  href="/popular-books"
                  iconBgColor={theme.palette.secondary.main}
                />
              </Grid>
            </Grid>
          </Container>
        </Box> */}
      </Box>

      <Footer />
      <FloatingChat/>
    </Box>
  );
};

export default Home;