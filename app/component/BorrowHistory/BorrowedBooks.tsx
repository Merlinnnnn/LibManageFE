import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Button, Grid,
  useTheme, useMediaQuery, List, ListItem, ListItemIcon,
  ListItemText, Divider, TextField, Avatar, IconButton
} from '@mui/material';
import Header from '../Home/Header';
import SoftBooksHistory from './SoftBooksHistory';
import HardBooksHistory from './HardBooksHistory';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useThemeContext } from '../Context/ThemeContext';
import apiService from '@/app/untils/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ApiResponse<T> {
  code: number;
  success: boolean;
  message: string;
  data: T;
}

interface UserInfo {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  avatar?: string;
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
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    avatar: 'https://img6.thuthuatphanmem.vn/uploads/2022/11/18/anh-avatar-don-gian-cho-nu_081757692.jpg'
  });

  useEffect(() => {
    const userInfoStr = localStorage.getItem('info');
    if (userInfoStr) {
      try {
        const parsedInfo = JSON.parse(userInfoStr) as UserInfo;
        if (parsedInfo.userId) {
          setCurrentUserId(parsedInfo.userId);
          fetchUserData(parsedInfo.userId);
        }
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    }
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      setLoading(true);
      const response = await apiService.get<ApiResponse<UserInfo>>(`/api/v1/users/info`);
      const userData = response.data.data;
      console.log('response User data', response);
      
      setUserInfo({
        fullName: `${userData.firstName} ${userData.lastName}`,
        email: userData.username,
        phone: userData.phoneNumber,
        address: userData.address,
        avatar: userData.avatar || 'https://img6.thuthuatphanmem.vn/uploads/2022/11/18/anh-avatar-don-gian-cho-nu_081757692.jpg'
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentUserId) return;
    
    try {
      setLoading(true);
      const [firstName, lastName] = userInfo.fullName.split(' ');
      
      const updateData = {
        firstName,
        lastName,
        phoneNumber: userInfo.phone,
        address: userInfo.address
      };

      await apiService.put(`/api/v1/users/${currentUserId}`, updateData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserInfo(prev => ({
          ...prev,
          avatar: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

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
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    {isEditing ? (
                      <IconButton 
                        color="primary" 
                        onClick={handleSave}
                        disabled={loading}
                      >
                        <SaveIcon />
                      </IconButton>
                    ) : (
                      <IconButton 
                        color="primary" 
                        onClick={() => setIsEditing(true)}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                  </Box>
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={4} sx={{ 
                      display: 'flex', 
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                      pt: 2,
                      px: { md: 4 }
                    }}>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="avatar-input"
                        onChange={handleImageChange}
                        disabled={!isEditing}
                      />
                      <label htmlFor="avatar-input">
                        <Box
                          component="img"
                          src={userInfo.avatar}
                          alt="User Avatar"
                          sx={{
                            width: 200,
                            height: 200,
                            borderRadius: '50%',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            objectFit: 'cover',
                            transition: 'all 0.3s ease',
                            cursor: isEditing ? 'pointer' : 'default',
                            '&:hover': {
                              transform: isEditing ? 'scale(1.05)' : 'none',
                              boxShadow: isEditing ? '0 6px 25px rgba(0,0,0,0.15)' : '0 4px 20px rgba(0,0,0,0.1)'
                            }
                          }}
                        />
                      </label>
                    </Grid>
                    <Grid item xs={12} md={8} sx={{ pt: 2 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Full Name"
                            value={userInfo.fullName}
                            onChange={(e) => setUserInfo(prev => ({ ...prev, fullName: e.target.value }))}
                            variant="outlined"
                            disabled={!isEditing}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: isEditing ? 'translateY(-2px)' : 'none',
                                  boxShadow: isEditing ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
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
                            disabled
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                transition: 'all 0.3s ease'
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Phone"
                            value={userInfo.phone}
                            onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                            variant="outlined"
                            disabled={!isEditing}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: isEditing ? 'translateY(-2px)' : 'none',
                                  boxShadow: isEditing ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
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
                            onChange={(e) => setUserInfo(prev => ({ ...prev, address: e.target.value }))}
                            variant="outlined"
                            multiline
                            rows={3}
                            disabled={!isEditing}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: isEditing ? 'translateY(-2px)' : 'none',
                                  boxShadow: isEditing ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                                }
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Box>
              )}
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
