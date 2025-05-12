import React, { useState } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Button, Grid,
  useTheme, useMediaQuery, List, ListItem, ListItemIcon,
  ListItemText, Divider, TextField, Avatar
} from '@mui/material';
import Header from '../Home/Header';
import SoftBooksHistory from './SoftBooksHistory';
import HardBooksHistory from './HardBooksHistory';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { useThemeContext } from '../Context/ThemeContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const UserInfo = () => {
  const theme = useTheme();
  const { mode } = useThemeContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mainTabValue, setMainTabValue] = useState(0);
  const [bookHistoryTabValue, setBookHistoryTabValue] = useState(0);
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    avatar: ''
  });

  const handleMainTabChange = (newValue: number) => {
    setMainTabValue(newValue);
  };

  const handleBookHistoryTabChange = (newValue: number) => {
    setBookHistoryTabValue(newValue);
  };

  const backgroundColor = mode === 'light' ? '#ffffff' : '#222428';
  const textColor = mode === 'light' ? '#000000' : '#ffffff';
  const hoverColor = mode === 'light' ? '#e0e0e0' : '#333333';
  const selectedColor = '#204A9C';

  return (
    <>
      <Header />
      <Box sx={{
        backgroundColor: mode === 'light' ? '#f9fafb' : '#1a1a1a',
        minHeight: '85vh',
        py: 4
      }}>
        <Box
          sx={{
            maxWidth: '1400px',
            margin: '0 auto',
            px: isMobile ? 2 : 4,
            display: 'flex',
            gap: 3
          }}
        >
          {/* Sidebar */}
          <Paper
            elevation={0}
            sx={{
              width: isMobile ? '100%' : '280px',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: 'fit-content',
              position: isMobile ? 'relative' : 'sticky',
              top: '20px',
              backgroundColor: backgroundColor,
              transition: 'all 0.3s ease'
            }}
          >
            <List sx={{ p: 2 }}>
              <ListItem
                component="div"
                onClick={() => handleMainTabChange(0)}
              sx={{
                  borderRadius: '8px',
                  mb: 1,
                  backgroundColor: mainTabValue === 0 ? selectedColor : 'transparent',
                  color: mainTabValue === 0 ? 'white' : textColor,
                  '&:hover': {
                    backgroundColor: hoverColor,
                    transform: 'translateX(8px)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <ListItemIcon>
                  <PersonIcon sx={{ 
                    color: mainTabValue === 0 ? 'white' : textColor,
                    transition: 'all 0.3s ease'
                  }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Personal Information" 
                  primaryTypographyProps={{
                    fontWeight: mainTabValue === 0 ? 'bold' : 'medium',
                    color: mainTabValue === 0 ? 'white' : textColor
                  }}
                />
              </ListItem>

              <ListItem
                component="div"
                onClick={() => handleMainTabChange(1)}
                sx={{
                  borderRadius: '8px',
                  mb: 1,
                  backgroundColor: mainTabValue === 1 ? selectedColor : 'transparent',
                  color: mainTabValue === 1 ? 'white' : textColor,
                  '&:hover': {
                    backgroundColor: hoverColor,
                    transform: 'translateX(8px)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <ListItemIcon>
                  <HistoryIcon sx={{ 
                    color: mainTabValue === 1 ? 'white' : textColor,
                    transition: 'all 0.3s ease'
                  }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Book History" 
                  primaryTypographyProps={{
                    fontWeight: mainTabValue === 1 ? 'bold' : 'medium',
                    color: mainTabValue === 1 ? 'white' : textColor
                  }}
                />
              </ListItem>
            </List>

            {mainTabValue === 1 && (
              <>
                <Divider sx={{ my: 1 }} />
                <List sx={{ p: 2 }}>
                  <ListItem
                    component="div"
                    onClick={() => handleBookHistoryTabChange(0)}
                    sx={{
                borderRadius: '8px',
                      mb: 1,
                      backgroundColor: bookHistoryTabValue === 0 ? selectedColor : 'transparent',
                      color: bookHistoryTabValue === 0 ? 'white' : textColor,
                                '&:hover': {
                        backgroundColor: hoverColor,
                        transform: 'translateX(8px)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <ListItemIcon>
                      <MenuBookIcon sx={{ 
                        color: bookHistoryTabValue === 0 ? 'white' : textColor,
                        transition: 'all 0.3s ease'
                      }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Soft Books" 
                      primaryTypographyProps={{
                        fontWeight: bookHistoryTabValue === 0 ? 'bold' : 'medium',
                        color: bookHistoryTabValue === 0 ? 'white' : textColor
                      }}
                    />
                  </ListItem>

                  <ListItem
                    component="div"
                    onClick={() => handleBookHistoryTabChange(1)}
                                      sx={{
                      borderRadius: '8px',
                      backgroundColor: bookHistoryTabValue === 1 ? selectedColor : 'transparent',
                      color: bookHistoryTabValue === 1 ? 'white' : textColor,
                                        '&:hover': {
                        backgroundColor: hoverColor,
                        transform: 'translateX(8px)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <ListItemIcon>
                      <AutoStoriesIcon sx={{ 
                        color: bookHistoryTabValue === 1 ? 'white' : textColor,
                        transition: 'all 0.3s ease'
                      }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Hard Books" 
                      primaryTypographyProps={{
                        fontWeight: bookHistoryTabValue === 1 ? 'bold' : 'medium',
                        color: bookHistoryTabValue === 1 ? 'white' : textColor
                      }}
                    />
                  </ListItem>
                </List>
              </>
            )}
          </Paper>

          {/* Main Content */}
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              backgroundColor: backgroundColor,
              transition: 'all 0.3s ease'
            }}
          >
            <TabPanel value={mainTabValue} index={0}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box
                      component="img"
                      src={userInfo.avatar || '/default-avatar.png'}
                      alt="User Avatar"
                                        sx={{
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        mb: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        objectFit: 'cover',
                        transition: 'all 0.3s ease',
                                          '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 6px 25px rgba(0,0,0,0.15)'
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      color="primary"
                                        sx={{
                        mt: 2,
                        transition: 'all 0.3s ease',
                                          '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      Change Avatar
                    </Button>
                                </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={userInfo.fullName}
                        variant="outlined"
                                            sx={{
                          '& .MuiOutlinedInput-root': {
                            transition: 'all 0.3s ease',
                                              '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }
                                              }
                                            }}
                                          />
                                        </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={userInfo.email}
                        variant="outlined"
                                            sx={{
                          '& .MuiOutlinedInput-root': {
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }
                          }
                        }}
                      />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={userInfo.phone}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address"
                        value={userInfo.address}
                        variant="outlined"
                        multiline
                        rows={3}
                  sx={{
                          '& .MuiOutlinedInput-root': {
                    transition: 'all 0.3s ease',
                    '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }
                          }
                        }}
                      />
              </Grid>
                    <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                        size="large"
                  sx={{
                          mt: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                          }
                        }}
                      >
                        Save Changes
                </Button>
              </Grid>
            </Grid>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={mainTabValue} index={1}>
              <TabPanel value={bookHistoryTabValue} index={0}>
                <SoftBooksHistory />
              </TabPanel>

              <TabPanel value={bookHistoryTabValue} index={1}>
                <HardBooksHistory />
              </TabPanel>
            </TabPanel>
          </Paper>
              </Box>
      </Box>
    </>
  );
};

export default UserInfo;
