import React, { useState, useEffect } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    IconButton,
    Box,
    TablePagination,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Button,
    Snackbar,
    Alert
} from '@mui/material';
import apiService from '../../untils/api';
import EmailIcon from '@mui/icons-material/Email';
import SendNotiDialog from './SendNotiDiolog';

interface User {
    userId: string;
    firstName: string;
    lastName: string;
    username: string;
    address: string;
    isActive: boolean;
}

const NewStudentsTable: React.FC = () => {
    const [students, setStudents] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDialog, setOpenDialog] = useState(false);
    const [openNotiDialog, setOpenNotiDialog] = useState(false);
    const [dialogUserId, setDialogUserId] = useState<string[]>([]);
    const [notificationTitle, setNotificationTitle] = useState("");
    const [notificationContent, setNotificationContent] = useState("");

    // Snackbar states
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (selectedUsers.length === 0) {
            setOpenNotiDialog(false);
        }
    }, [selectedUsers]);

    const fetchStudents = async () => {
        try {
            const response = await apiService.get<{ result: { content: User[] } }>('/api/v1/users');
            setStudents(response.data.result.content);
            console.log("ds student", response.data.result.content);
        } catch (error) {
            console.error("Lỗi khi gọi API danh sách sinh viên:", error);
        }
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedUsers(students.map((student) => student.userId));
            setOpenNotiDialog(true);
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectUser = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter((id) => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
            setOpenNotiDialog(true);
        }
    };

    const handleOpenDialog = (userId: string) => {
        setDialogUserId((prevUserIds) => [...prevUserIds, userId]);
        console.log(userId);
        setOpenDialog(true);
    };

    const handleCloseOpenNoti = () => {
        console.log('user', selectedUsers);
        setOpenNotiDialog(false);
    };

    const handleSend = () => {
        console.log('user', selectedUsers);
        setDialogUserId(selectedUsers);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setDialogUserId([]);
        setNotificationTitle("");
        setNotificationContent("");
    };

    const handleSendNotification = async () => {
        if (dialogUserId.length > 0) {
            const payload = {
                "userIds": dialogUserId,
                "title": notificationTitle,
                "content": notificationContent
            };
            console.log(payload);
            try {
                const response = await apiService.post(`/api/v1/notifications`, payload);
                console.log(response);
                setSnackbarMessage('Thông báo đã được gửi thành công!');
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                handleCloseDialog();
                setSelectedUsers([]);
            } catch (error) {
                console.error("Lỗi khi gửi thông báo:", error);
                setSnackbarMessage('Có lỗi xảy ra khi gửi thông báo');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
            }
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <Box>
            <TableContainer component={Paper} style={{ maxHeight: '300px', overflow: 'auto' }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox" style={{ padding: '4px 8px' }}>
                                <Checkbox
                                    indeterminate={selectedUsers.length > 0 && selectedUsers.length < students.length}
                                    checked={selectedUsers.length === students.length && students.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </TableCell>
                            <TableCell style={{ padding: '4px 8px' }}>First Name</TableCell>
                            <TableCell style={{ padding: '4px 8px' }}>Last Name</TableCell>
                            <TableCell style={{ padding: '4px 8px' }}>Username</TableCell>
                            <TableCell style={{ padding: '4px 8px' }}>Address</TableCell>
                            <TableCell style={{ padding: '4px 8px' }}>Is Active</TableCell>
                            <TableCell style={{ padding: '4px 8px' }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((student) => (
                            <TableRow key={student.userId}>
                                <TableCell padding="checkbox" style={{ padding: '4px 8px' }}>
                                    <Checkbox
                                        checked={selectedUsers.includes(student.userId)}
                                        onChange={() => handleSelectUser(student.userId)}
                                    />
                                </TableCell>
                                <TableCell style={{ padding: '4px 8px' }}>{student.firstName}</TableCell>
                                <TableCell style={{ padding: '4px 8px' }}>{student.lastName}</TableCell>
                                <TableCell style={{ padding: '4px 8px' }}>{student.username}</TableCell>
                                <TableCell style={{ padding: '4px 8px' }}>{student.address}</TableCell>
                                <TableCell style={{ padding: '4px 8px' }}>{student.isActive ? 'Yes' : 'No'}</TableCell>
                                <TableCell style={{ padding: '4px 8px' }}>
                                    <IconButton color="primary" onClick={() => handleOpenDialog(student.userId)}>
                                        <EmailIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={students.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
            <SendNotiDialog open={openNotiDialog} handleClose={handleCloseOpenNoti} quantity={selectedUsers.length} onSend={handleSend} />
            {/* Dialog for Sending Notification */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Send Notification</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter the title and content of the notification you want to send.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Title"
                        type="text"
                        fullWidth
                        value={notificationTitle}
                        onChange={(e) => setNotificationTitle(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Content"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        value={notificationContent}
                        onChange={(e) => setNotificationContent(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSendNotification} color="primary">
                        Send
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for Notifications */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default NewStudentsTable;
