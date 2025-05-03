import React, { useState } from 'react';
import { Box, Button, Checkbox, Divider, FormControlLabel, IconButton, Link, TextField, Typography } from '@mui/material';
import { Visibility, VisibilityOff, Google as GoogleIcon, Home } from '@mui/icons-material';
import { useAuth } from '../../component/Context/AuthContext';

// Đưa LeftImage và RightForm ra ngoài

const LeftImage = () => (
  <Box
    sx={{
      width: '50%',
      height: '100%',
      backgroundImage: 'url(https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  />
);

interface RightFormProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  showPassword: boolean;
  toggleShowPassword: () => void;
  handleLogin: () => void;
}

const RightForm: React.FC<RightFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  toggleShowPassword,
  handleLogin,
}) => (
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

    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
      Welcome Back
    </Typography>
    <Typography variant="body2" sx={{ color: '#aaa', mb: 3 }}>
      Don't have an account?{' '}
      <Link href="/signup" underline="hover" color="primary">
        Sign up
      </Link>
    </Typography>

    <TextField
      fullWidth
      label="Email"
      variant="filled"
      margin="normal"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      InputProps={{
        sx: { backgroundColor: '#2c2c2c', color: 'white' },
      }}
      InputLabelProps={{ sx: { color: '#888' } }}
    />

    <TextField
      fullWidth
      label="Password"
      type={showPassword ? 'text' : 'password'}
      variant="filled"
      margin="normal"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      InputProps={{
        sx: { backgroundColor: '#2c2c2c', color: 'white' },
        endAdornment: (
          <IconButton onClick={toggleShowPassword} edge="end" sx={{ color: '#888' }}>
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        ),
      }}
      InputLabelProps={{ sx: { color: '#888' } }}
    />

    <FormControlLabel
      control={<Checkbox sx={{ color: '#888' }} />}
      label={<Typography variant="body2" sx={{ color: '#aaa' }}>Remember me</Typography>}
      sx={{ my: 1 }}
    />

    <Button
      fullWidth
      variant="contained"
      onClick={handleLogin}
      sx={{
        mt: 2,
        py: 1.5,
        fontWeight: 'bold',
        backgroundColor: '#8B5CF6',
        '&:hover': { backgroundColor: '#7C3AED' },
      }}
    >
      Sign In
    </Button>

    <Divider sx={{ my: 3, borderColor: '#444' }}>OR</Divider>

    <Button
      fullWidth
      variant="outlined"
      startIcon={<GoogleIcon />}
      sx={{
        py: 1.5,
        color: 'white',
        borderColor: '#555',
        '&:hover': { borderColor: '#888' },
      }}
    >
      Sign in with Google
    </Button>
  </Box>
);

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
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
          flexDirection: 'row',
          backgroundColor: '#1F1F1F',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}
      >
        <LeftImage />
        <RightForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          toggleShowPassword={handleTogglePassword}
          handleLogin={handleLogin}
        />
      </Box>
    </Box>
  );
};

export default LoginForm;
