import React from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    IconButton,
    Link,
    useTheme,
    alpha
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useThemeContext } from '../Context/ThemeContext';

const Footer: React.FC = () => {
    const { mode } = useThemeContext();
    const theme = useTheme();

    return (
        <Box
            component="footer"
            sx={{
                background: mode === 'dark' 
                    ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
                    : 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                color: 'white',
                py: 6,
                mt: 'auto',
                boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.15)',
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* About Section */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            About LibHub
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                            LibHub is your digital library platform, providing access to a vast collection of books and resources for students and educators.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton 
                                sx={{ 
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.common.white, 0.1),
                                    }
                                }}
                            >
                                <FacebookIcon />
                            </IconButton>
                            <IconButton 
                                sx={{ 
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.common.white, 0.1),
                                    }
                                }}
                            >
                                <TwitterIcon />
                            </IconButton>
                            <IconButton 
                                sx={{ 
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.common.white, 0.1),
                                    }
                                }}
                            >
                                <InstagramIcon />
                            </IconButton>
                            <IconButton 
                                sx={{ 
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.common.white, 0.1),
                                    }
                                }}
                            >
                                <LinkedInIcon />
                            </IconButton>
                        </Box>
                    </Grid>

                    {/* Quick Links */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Quick Links
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Link href="/home" color="inherit" sx={{ textDecoration: 'none', '&:hover': { opacity: 0.8 } }}>
                                Home
                            </Link>
                            <Link href="/my-bookshelf" color="inherit" sx={{ textDecoration: 'none', '&:hover': { opacity: 0.8 } }}>
                                My Bookshelf
                            </Link>
                            <Link href="/bookfavo" color="inherit" sx={{ textDecoration: 'none', '&:hover': { opacity: 0.8 } }}>
                                Favorites
                            </Link>
                            <Link href="/borrowed-book" color="inherit" sx={{ textDecoration: 'none', '&:hover': { opacity: 0.8 } }}>
                                Borrowed Books
                            </Link>
                        </Box>
                    </Grid>

                    {/* Contact Information */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Contact Us
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EmailIcon sx={{ opacity: 0.8 }} />
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                    support@libhub.com
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneIcon sx={{ opacity: 0.8 }} />
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                    +84 123 456 789
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationOnIcon sx={{ opacity: 0.8 }} />
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                    123 University Street, District 1, Ho Chi Minh City
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                {/* Copyright */}
                <Box sx={{ 
                    mt: 4, 
                    pt: 3, 
                    borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                    textAlign: 'center' 
                }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        © {new Date().getFullYear()} LibHub. All rights reserved.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer; 