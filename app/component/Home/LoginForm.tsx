import React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Link } from '@mui/material';

interface LoginFormProps {
  open: boolean;
  handleClose: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ open, handleClose }) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      PaperProps={{
        style: {
          width: '400px',
          padding: '20px',
          textAlign: 'center',
          borderRadius: '10px',
        },
      }}
    >
      {/* Tiêu đề */}
      <DialogTitle id="form-dialog-title">
        <Typography variant="h5" style={{ fontWeight: 'bold' }}>Log in</Typography>
      </DialogTitle>

      <DialogContent style={{ textAlign: 'left' }}>
        {/* Lời chào */}
        <Typography variant="body1" style={{ marginBottom: '20px' }}>
          Welcome to Britannica's Community Access Manager! Please log in to join the conversation.
        </Typography>

        <TextField
          autoFocus
          margin="dense"
          id="username"
          label="Username Or Email"
          type="text"
          fullWidth
          variant="outlined"
        />

        <TextField
          margin="dense"
          id="password"
          label="Password"
          type="password"
          fullWidth
          variant="outlined"
          style={{ marginBottom: '10px' }}
        />

        <Box display="flex" justifyContent="flex-end">
          <Link href="#" variant="body2">
            Forgot Password
          </Link>
        </Box>
      </DialogContent>

      <DialogActions style={{ justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          style={{
            backgroundColor: '#0056b3',
            padding: '10px 0',
            marginBottom: '10px',
            fontWeight: 'bold',
            textTransform: 'none',
          }}
        >
          Log in
        </Button>
      </DialogActions>

      {/* Đăng ký */}
      <Typography variant="body2" style={{ marginBottom: '10px' }}>
        <Link href="#" style={{ fontWeight: 'bold' }}>
          Create an Account
        </Link>
      </Typography>
    </Dialog>
  );
};

export default LoginForm;
