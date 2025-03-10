import React, { useState } from 'react';
import { TextField, Button, Checkbox, FormControlLabel, Link, Typography, Box, Divider, IconButton, InputAdornment } from '@mui/material';
import { Google as GoogleIcon, Facebook as FacebookIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../component/Context/AuthContext';

const LoginForm: React.FC = () => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (error) {
      console.log('Login failed:', error);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Box
        sx={{
          width: '400px',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          textAlign: 'center',
        }}
      >
        {/* <Typography  > */}
        <Link href="/home" variant="h6" sx={{ marginBottom: '20px', fontWeight: 'bold', color: '#646cff', textDecoration: 'none' }}>
          LibHub</Link>
        {/* </Typography> */}

        <Typography variant="h4" sx={{ marginBottom: '20px', fontWeight: 'bold' }}>
          Sign in
        </Typography>

        <TextField
          fullWidth
          label="Email"
          placeholder="your@email.com"
          margin="normal"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputLabelProps={{
            style: { color: theme.palette.text.primary },
          }}
        />

        <TextField
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          margin="normal"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleTogglePassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />} {/* Đổi icon */}
                </IconButton>
              </InputAdornment>
            ),
          }}
          InputLabelProps={{
            style: { color: theme.palette.text.primary },
          }}
        />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <FormControlLabel
            control={<Checkbox color="primary" />}
            label="Remember me"
            sx={{ color: theme.palette.text.primary }} // Màu chữ từ theme
          />
          <Link href="#" variant="body2" sx={{ color: theme.palette.text.primary }}>
            Forgot your password?
          </Link>
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{
            padding: '10px',
            backgroundColor: '#000000',
            color: 'white',
            fontWeight: 'bold',
            marginTop: '10px',
          }}
          onClick={handleLogin}
        >
          Sign in
        </Button>

        <Typography variant="body2" sx={{ marginTop: '10px' }}>
          Don't have an account? <Link href="/signup" sx={{ color: theme.palette.text.primary }}>Sign up</Link>
        </Typography>

        <Divider sx={{ margin: '20px 0' }}>or</Divider>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<GoogleIcon />}
          sx={{
            marginBottom: '10px',
            padding: '10px',
            color: 'black',
            borderColor: 'black',
          }}
        >
          Sign in with Google
        </Button>
      </Box>
    </Box>
  );
};

export default LoginForm;
