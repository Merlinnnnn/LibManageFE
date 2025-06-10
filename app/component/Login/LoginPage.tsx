import React, { useState } from 'react';
import { Box, Button, Checkbox, Divider, FormControlLabel, IconButton, Link, TextField, Typography, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
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
  loading: boolean;
  handleResetPassword: (resetEmail: string) => void;
}

const RightForm: React.FC<RightFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  toggleShowPassword,
  handleLogin,
  loading,
  handleResetPassword,
}) => {
  const { loginGoogle } = useAuth();
  const [resetEmail, setResetEmail] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleOpenResetDialog = () => {
    setResetDialogOpen(true);
  };

  const handleCloseResetDialog = () => {
    setResetDialogOpen(false);
    setResetEmail('');
  };

  const handleSubmitReset = async () => {
    if (!resetEmail) {
      alert('Vui lòng nhập email của bạn');
      return;
    }
    setResetLoading(true);
    try {
      await handleResetPassword(resetEmail);
      handleCloseResetDialog();
    } catch (error) {
      console.error('Reset password error:', error);
    } finally {
      setResetLoading(false);
    }
  };

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
        Chào mừng trở lại
      </Typography>
      <Typography variant="body2" sx={{ color: '#aaa', mb: 3 }}>
        Chưa có tài khoản?{' '}
        <Link href="/signup" underline="hover" color="primary">
          Đăng ký
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
        label="Mật khẩu"
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <FormControlLabel
          control={<Checkbox sx={{ color: '#888' }} />}
          label={<Typography variant="body2" sx={{ color: '#aaa' }}>Ghi nhớ đăng nhập</Typography>}
        />
        <Link
          component="button"
          variant="body2"
          onClick={handleOpenResetDialog}
          sx={{ color: '#8B5CF6', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Quên mật khẩu?
        </Link>
      </Box>

      {/* Reset Password Dialog */}
      <Dialog 
        open={resetDialogOpen} 
        onClose={handleCloseResetDialog}
        PaperProps={{
          sx: {
            backgroundColor: '#1F1F1F',
            color: 'white',
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>Đặt lại mật khẩu</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#aaa', mb: 2 }}>
            Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
          </Typography>
          <TextField
            fullWidth
            label="Email"
            variant="filled"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            InputProps={{
              sx: { backgroundColor: '#2c2c2c', color: 'white' },
            }}
            InputLabelProps={{ sx: { color: '#888' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={handleCloseResetDialog}
            sx={{ 
              color: '#aaa',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmitReset}
            variant="contained"
            disabled={resetLoading}
            sx={{
              backgroundColor: '#8B5CF6',
              '&:hover': { backgroundColor: '#7C3AED' },
            }}
          >
            {resetLoading ? <CircularProgress size={24} color="inherit" /> : 'Gửi'}
          </Button>
        </DialogActions>
      </Dialog>

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
        disabled={loading}
      >
        {loading ? <><CircularProgress size={22} color="inherit" sx={{ mr: 1 }} /> Đang đăng nhập...</> : 'Đăng nhập'}
      </Button>

      <Divider sx={{ my: 3, borderColor: '#444' }}>HOẶC</Divider>

      <Button
        fullWidth
        variant="outlined"
        startIcon={<GoogleIcon />}
        onClick={loginGoogle}
        sx={{
          py: 1.5,
          color: 'white',
          borderColor: '#555',
          '&:hover': { 
            borderColor: '#888',
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          },
        }}
      >
        Đăng nhập với Google
      </Button>
    </Box>
  );
};

const LoginForm: React.FC = () => {
  const { login, resetPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      console.error('Đăng nhập thất bại:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (resetEmail: string) => {
    try {
      await resetPassword(resetEmail);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
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
          loading={loading}
          handleResetPassword={handleResetPassword}
        />
      </Box>
    </Box>
  );
};

export default LoginForm;
