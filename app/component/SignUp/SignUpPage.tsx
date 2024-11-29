import React, { useState } from 'react';
import { TextField, Button, Checkbox, FormControlLabel, Link, Typography, Box, Divider, IconButton, InputAdornment } from '@mui/material';
import { Google as GoogleIcon, Facebook as FacebookIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../component/Context/AuthContext';

const SignupForm: React.FC = () => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login } = useAuth();

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert('Password and Confirm Password must be the same');
      return;
    }
    try {
      // Call the signup API or logic here
      console.log('Signup successful');
      // If successful, you can then log the user in
      //await login(email, password);
    } catch (error) {
      console.error('Signup failed:', error);
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
        <Link href="/home" variant="h6" sx={{ marginBottom: '20px', fontWeight: 'bold', color: '#646cff', textDecoration: 'none' }}>
        LibHub</Link>

        <Typography variant="h4" sx={{ marginBottom: '20px', fontWeight: 'bold' }}>
          Sign up
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
            style: { color: 'black' },
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
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          InputLabelProps={{
            style: { color: 'black' },
          }}
        />

        <TextField
          fullWidth
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          margin="normal"
          variant="outlined"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleTogglePassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          InputLabelProps={{
            style: { color: 'black' },
          }}
        />


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
          onClick={handleSignup}
        >
          Sign up
        </Button>

        <Typography variant="body2" sx={{ marginTop: '10px' }}>
          Already have an account? <Link href="/login" sx={{ color: theme.palette.text.primary }}>Sign in</Link>
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
          Sign up with Google
        </Button>
      </Box>
    </Box>
  );
};

export default SignupForm;
