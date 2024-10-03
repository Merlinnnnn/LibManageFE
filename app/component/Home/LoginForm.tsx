import React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Checkbox, FormControlLabel } from '@mui/material';

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
          width: '500px',
          height: '650px',
        },
      }}
    >
      <DialogTitle id="form-dialog-title">Đăng nhập</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="username"
          label="Tên đăng nhập"
          type="text"
          fullWidth
        />
        <TextField
          margin="dense"
          id="password"
          label="Mật khẩu"
          type="password"
          fullWidth
        />
        <FormControlLabel
          control={<Checkbox name="remember" />}
          label="Ghi nhớ đăng nhập"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Hủy
        </Button>
        <Button onClick={handleClose} color="primary">
          Đăng nhập
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginForm;
