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
            gap: 3,
            flexDirection: isMobile ? 'column' : 'row'
          }}
        >
          {/* Sidebar */}
          <Paper
            elevation={0}
            sx={{
              width: isMobile ? '100%' : '280px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: 'fit-content',
              position: isMobile ? 'relative' : 'sticky',
              top: '20px',
              backgroundColor: backgroundColor,
              transition: 'all 0.3s ease'
            }}
          >
            <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              <Avatar
                src={userInfo.avatar}
                sx={{
                  width: 100,
                  height: 100,
                  margin: '0 auto 16px',
                  border: '4px solid #fff',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                {userInfo.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userInfo.email}
              </Typography>
            </Box>

            <List sx={{ p: 2 }}>
              <ListItem
                component="div"
                onClick={() => handleMainTabChange(0)}
                sx={{
                  borderRadius: '12px',
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
                  borderRadius: '12px',
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
                  primary="Borrowing History" 
                  primaryTypographyProps={{
                    fontWeight: mainTabValue === 1 ? 'bold' : 'medium',
                    color: mainTabValue === 1 ? 'white' : textColor
                  }}
                />
              </ListItem>
            </List>
          </Paper>

          {/* Main Content */}
          <Box sx={{ flex: 1 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                backgroundColor: backgroundColor,
                transition: 'all 0.3s ease'
              }}
            >
              {/* Personal Information Tab */}
              <TabPanel value={mainTabValue} index={0}>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      Personal Information
                    </Typography>
                    <IconButton
                      onClick={() => setIsEditing(!isEditing)}
                      sx={{
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.1)' }
                      }}
                    >
                      {isEditing ? <SaveIcon /> : <EditIcon />}
                    </IconButton>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={userInfo.fullName}
                        onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })}
                        disabled={!isEditing}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: 'rgba(0,0,0,0.02)'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={userInfo.email}
                        disabled
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: 'rgba(0,0,0,0.02)'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={userInfo.phone}
                        onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                        disabled={!isEditing}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: 'rgba(0,0,0,0.02)'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Address"
                        value={userInfo.address}
                        onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
                        disabled={!isEditing}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: 'rgba(0,0,0,0.02)'
                          }
                        }}
                      />
                    </Grid>
                  </Grid>

                  {isEditing && (
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setIsEditing(false)}
                        sx={{ borderRadius: '12px' }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleSave}
                        sx={{ borderRadius: '12px' }}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  )}
                </Box>
              </TabPanel>

              {/* Borrowing History Tab */}
              <TabPanel value={mainTabValue} index={1}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Borrowing History
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant={bookHistoryTabValue === 0 ? 'contained' : 'text'}
                          onClick={() => handleBookHistoryTabChange(0)}
                          startIcon={<MenuBookIcon />}
                          sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            px: 3
                          }}
                        >
                          Digital Books
                        </Button>
                        <Button
                          variant={bookHistoryTabValue === 1 ? 'contained' : 'text'}
                          onClick={() => handleBookHistoryTabChange(1)}
                          startIcon={<AutoStoriesIcon />}
                          sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            px: 3
                          }}
                        >
                          Physical Books
                        </Button>
                      </Box>
                    </Box>
                  </Box>

                  {bookHistoryTabValue === 0 ? (
                    <SoftBooksHistory />
                  ) : (
                    <HardBooksHistory />
                  )}
                </Box>
              </TabPanel>
            </Paper>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default UserInfo;
