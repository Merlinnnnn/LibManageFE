import React from 'react';
import {
    Button, DialogContent, IconButton, Typography, Box, Modal
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

interface DialogComponentProps {
    open: boolean;
    handleClose: () => void;
    quantity: number;
    onSend: () => void;
}

const SendNotiDialog: React.FC<DialogComponentProps> = ({ open, handleClose, quantity, onSend }) => {
    const handleSend = () => {
        onSend();
        handleClose();
    };

    return (
        <Modal
            open={open}
            onClose={(event, reason) => {
                if (reason !== "backdropClick") {
                    handleClose();
                }
            }}
            disableEnforceFocus
            hideBackdrop
            style={{ position: 'initial' }}
            slotProps={{
                backdrop: {
                    sx: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: -1,
                        pointerEvents: 'none',
                    }
                }
            }}
        >
            <Box sx={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translate(-50%, 0)',
                width: '100%',
                maxWidth: 500,
                bgcolor: 'background.paper',
                boxShadow: 24,
                borderRadius: '4px',
                pointerEvents: 'auto',
            }}>
                <DialogContent sx={{ padding: 0, display: 'flex', alignItems: 'center', height: '60px', border: '2px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#000B58', height: '100%', width: '60px', justifyContent: 'center', color: '#fff', borderRadius: '8px' }}>
                        {quantity}
                    </Box>
                    <Typography sx={{ flexGrow: 1, paddingLeft: '16px', color: '#000' }}>Data Selected</Typography>
                    <Button
                        color="primary"
                        variant="contained"
                        startIcon={<SendIcon />}
                        onClick={handleSend}
                        sx={{ marginRight: '8px', height: '32px' }}
                    >
                        Send Noti
                    </Button>
                    <IconButton size="small" color="default" onClick={handleClose} sx={{ marginRight: '8px' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogContent>
            </Box>
        </Modal>
    );
};

export default SendNotiDialog;
