import React, { useState } from 'react';
import { Box, Button, Divider, IconButton, Link, TextField, Typography } from '@mui/material';
import { Google as GoogleIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { Home } from '@mui/icons-material';
import { useAuth } from '../../component/Context/AuthContext';

const LeftImage = () => (
  <Box
    sx={{
      width: '50%',
      height: '100%',
      backgroundImage: 'url(https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(31,31,31,0.3) 0%, rgba(31,31,31,0.7) 100%)',
      },
      '@keyframes zoomIn': {
        '0%': { transform: 'scale(1)' },
        '100%': { transform: 'scale(1.05)' },
      },
      animation: 'zoomIn 20s infinite alternate',
    }}
  />
);

interface RightFormProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  showPassword: boolean;
  showConfirmPassword: boolean;
  toggleShowPassword: () => void;
  toggleShowConfirmPassword: () => void;
  handleSignup: () => void;
}

const RightForm: React.FC<RightFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  showConfirmPassword,
  toggleShowPassword,
  toggleShowConfirmPassword,
  handleSignup,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '50%',
        height: '100%',
        padding: { xs: 3, md: 6 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        color: 'white',
        backgroundColor: '#1F1F1F',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 'inset 0 0 30px rgba(139, 92, 246, 0.1)',
        },
      }}
    >
      <IconButton
        href="/home"
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          color: '#fff',
          backgroundColor: '#2c2c2c',
          '&:hover': {
            backgroundColor: '#8B5CF6',
          },
          zIndex: 10,
        }}
      >
        <Home />
      </IconButton>

      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          mb: 1,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            left: 0,
            width: '50px',
            height: '3px',
            background: '#8B5CF6',
            transition: 'width 0.3s ease',
          },
          '&:hover::after': {
            width: '80px',
          }
        }}
      >
        Đăng ký
      </Typography>
      <Typography variant="body2" sx={{ color: '#aaa', mb: 3 }}>
        Đã có tài khoản?{' '}
        <Link
          href="/login"
          underline="hover"
          color="primary"
          sx={{
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -2,
              left: 0,
              width: '0%',
              height: '1px',
              background: 'currentColor',
              transition: 'width 0.3s ease',
            },
            '&:hover::after': {
              width: '100%',
            }
          }}
        >
          Đăng nhập
        </Link>
      </Typography>

      <Box sx={{ '& > *': { mb: 2 } }}>
        <TextField
          fullWidth
          label="Email"
          variant="filled"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputProps={{
            sx: {
              backgroundColor: '#2c2c2c',
              color: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#333',
              },
              '&.Mui-focused': {
                backgroundColor: '#333',
                boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.5)',
              }
            },
          }}
          InputLabelProps={{
            sx: {
              color: '#888',
              transition: 'all 0.3s ease',
              '&.Mui-focused': {
                color: '#8B5CF6',
              }
            }
          }}
        />

        <TextField
          fullWidth
          label="Mật khẩu"
          type={showPassword ? 'text' : 'password'}
          variant="filled"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            sx: {
              backgroundColor: '#2c2c2c',
              color: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#333',
              },
              '&.Mui-focused': {
                backgroundColor: '#333',
                boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.5)',
              }
            },
            endAdornment: (
              <IconButton
                onClick={toggleShowPassword}
                edge="end"
                sx={{
                  color: '#888',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: '#8B5CF6',
                    transform: 'scale(1.1)',
                  }
                }}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            ),
          }}
          InputLabelProps={{
            sx: {
              color: '#888',
              transition: 'all 0.3s ease',
              '&.Mui-focused': {
                color: '#8B5CF6',
              }
            }
          }}
        />

        <TextField
          fullWidth
          label="Xác nhận mật khẩu"
          type={showConfirmPassword ? 'text' : 'password'}
          variant="filled"
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          InputProps={{
            sx: {
              backgroundColor: '#2c2c2c',
              color: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#333',
              },
              '&.Mui-focused': {
                backgroundColor: '#333',
                boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.5)',
              }
            },
            endAdornment: (
              <IconButton
                onClick={toggleShowConfirmPassword}
                edge="end"
                sx={{
                  color: '#888',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: '#8B5CF6',
                    transform: 'scale(1.1)',
                  }
                }}
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            ),
          }}
          InputLabelProps={{
            sx: {
              color: '#888',
              transition: 'all 0.3s ease',
              '&.Mui-focused': {
                color: '#8B5CF6',
              }
            }
          }}
        />
      </Box>

      <Button
        fullWidth
        variant="contained"
        onClick={handleSignup}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          mt: 2,
          py: 1.5,
          fontWeight: 'bold',
          backgroundColor: '#8B5CF6',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            backgroundColor: '#7C3AED',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '5px',
            height: '5px',
            background: 'rgba(255, 255, 255, 0.5)',
            opacity: 0,
            borderRadius: '100%',
            transform: 'scale(1, 1) translate(-50%)',
            transformOrigin: '50% 50%',
          },
          ...(isHovered && {
            '&::after': {
              animation: 'ripple 1s ease-out',
            }
          }),
          '@keyframes ripple': {
            '0%': {
              transform: 'scale(0, 0)',
              opacity: 0.5,
            },
            '100%': {
              transform: 'scale(20, 20)',
              opacity: 0,
            },
          },
        }}
      >
        Đăng ký
      </Button>

      <Divider
        sx={{
          my: 3,
          borderColor: '#444',
          '&::before, &::after': {
            borderColor: '#444',
          },
          '& .MuiDivider-wrapper': {
            px: 1,
            color: '#888',
          }
        }}
      >
        HOẶC
      </Divider>

      <Button
        fullWidth
        variant="outlined"
        startIcon={<GoogleIcon />}
        sx={{
          py: 1.5,
          color: 'white',
          borderColor: '#555',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#888',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            transform: 'translateY(-2px)',
          },
          '& .MuiButton-startIcon': {
            transition: 'transform 0.3s ease',
          },
          '&:hover .MuiButton-startIcon': {
            transform: 'scale(1.2)',
          }
        }}
      >
        Đăng ký với Google
      </Button>
    </Box>
  );
};

const SignupForm: React.FC = () => {
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleTogglePassword = () => setShowPassword(!showPassword);
  const handleToggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert('Password and Confirm Password must be the same');
      return;
    }
    try {
      await signup(email, password);
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
      }}
    >
      <Box
        sx={{
          width: { xs: '100%', md: '900px' },
          height: { xs: '100%', md: '600px' },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          backgroundColor: '#1F1F1F',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          transition: 'all 0.5s ease',
          '&:hover': {
            boxShadow: '0 12px 28px rgba(0,0,0,0.6)',
          }
        }}
      >
        <LeftImage />
        <RightForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          toggleShowPassword={handleTogglePassword}
          toggleShowConfirmPassword={handleToggleConfirmPassword}
          handleSignup={handleSignup}
        />
      </Box>
    </Box>
  );
};

export default SignupForm;