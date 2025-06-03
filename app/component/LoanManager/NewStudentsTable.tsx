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
    Alert,
    InputAdornment,
    Grid,
    useTheme,
    Tooltip,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import apiService from '../../untils/api';
import EmailIcon from '@mui/icons-material/Email';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import SendNotiDialog from './SendNotiDiolog';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';

interface User {
    userId: string;
    firstName: string;
    lastName: string;
    username: string;
    address: string;
    isActive: boolean;
}

const NewStudentsTable: React.FC = () => {
    const theme = useTheme();
    const [students, setStudents] = useState<User[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDialog, setOpenDialog] = useState(false);
    const [openNotiDialog, setOpenNotiDialog] = useState(false);
    const [dialogUserId, setDialogUserId] = useState<string[]>([]);
    const [notificationTitle, setNotificationTitle] = useState("");
    const [notificationContent, setNotificationContent] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRole, setSelectedRole] = useState<string>('user');
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    // Snackbar states
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    useEffect(() => {
        // Lấy role từ localStorage
        const infoString = localStorage.getItem('info');
        if (infoString) {
            try {
                const info = JSON.parse(infoString);
                if (info.roles && Array.isArray(info.roles)) {
                    setIsAdmin(info.roles.includes('ADMIN'));
                    if (info.roles.includes('ADMIN')) {
                        setSelectedRole('user');
                    } else {
                        setSelectedRole('user');
                    }
                }
            } catch (e) {
                setIsAdmin(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [selectedRole]);

    useEffect(() => {
        if (selectedUsers.length === 0) {
            setOpenNotiDialog(false);
        }
    }, [selectedUsers]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredStudents(students);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = students.filter(student => 
                (student.firstName || '').toLowerCase().includes(query) ||
                (student.lastName || '').toLowerCase().includes(query) ||
                (student.username || '').toLowerCase().includes(query) ||
                (student.address || '').toLowerCase().includes(query)
            );
            setFilteredStudents(filtered);
        }
    }, [searchQuery, students]);

    const fetchStudents = async () => {
        try {
            const response = await apiService.get<{ data: { content: User[] } }>(
                '/api/v1/users',
                // { params: { role: selectedRole } }
            );
            setStudents(response.data.data.content);
            setFilteredStudents(response.data.data.content);
        } catch (error) {
            console.log("Lỗi khi gọi API danh sách sinh viên:", error);
        }
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedUsers(filteredStudents.map((student) => student.userId));
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
        setOpenDialog(true);
    };

    const handleCloseOpenNoti = () => {
        setOpenNotiDialog(false);
    };

    const handleSend = () => {
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
            try {
                const response = await apiService.post(`/api/v1/notifications`, payload);
                setSnackbarMessage('Thông báo đã được gửi thành công!');
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                handleCloseDialog();
                setSelectedUsers([]);
            } catch (error) {
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

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        setPage(0);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    // Xóa user
    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
        try {
            await apiService.delete(`/api/v1/users/${userId}`);
            setSnackbarMessage('Xóa người dùng thành công!');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
            fetchStudents();
        } catch (error) {
            setSnackbarMessage('Có lỗi xảy ra khi xóa người dùng');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Tìm kiếm theo tên, username hoặc địa chỉ..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery && (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={handleClearSearch}
                                        >
                                            <ClearIcon />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="role-select-label">Role</InputLabel>
                            <Select
                                labelId="role-select-label"
                                id="role-select"
                                value={selectedRole}
                                label="Role"
                                onChange={(e) => setSelectedRole(e.target.value)}
                                disabled={!isAdmin}
                            >
                                <MenuItem value="user">User</MenuItem>
                                {isAdmin && <MenuItem value="manager">Manager</MenuItem>}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>

            <TableContainer 
                component={Paper} 
                sx={{ 
                    maxHeight: '300px', 
                    overflow: 'auto',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                }}
            >
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: theme.palette.background.default }}>
                            <TableCell padding="checkbox" sx={{ padding: '4px 8px', fontWeight: 600 }}>
                                <Checkbox
                                    indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredStudents.length}
                                    checked={selectedUsers.length === filteredStudents.length && filteredStudents.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </TableCell>
                            <TableCell sx={{ padding: '4px 8px', fontWeight: 600 }}>First Name</TableCell>
                            <TableCell sx={{ padding: '4px 8px', fontWeight: 600 }}>Last Name</TableCell>
                            <TableCell sx={{ padding: '4px 8px', fontWeight: 600 }}>Username</TableCell>
                            <TableCell sx={{ padding: '4px 8px', fontWeight: 600 }}>Address</TableCell>
                            <TableCell sx={{ padding: '4px 8px', fontWeight: 600 }}>Is Active</TableCell>
                            <TableCell sx={{ padding: '4px 8px', fontWeight: 600 }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredStudents
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((student) => (
                                <TableRow 
                                    key={student.userId}
                                    sx={{ 
                                        '&:hover': {
                                            backgroundColor: theme.palette.action.hover
                                        }
                                    }}
                                >
                                    <TableCell padding="checkbox" sx={{ padding: '4px 8px' }}>
                                        <Checkbox
                                            checked={selectedUsers.includes(student.userId)}
                                            onChange={() => handleSelectUser(student.userId)}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ padding: '4px 8px' }}>{student.firstName}</TableCell>
                                    <TableCell sx={{ padding: '4px 8px' }}>{student.lastName}</TableCell>
                                    <TableCell sx={{ padding: '4px 8px' }}>{student.username}</TableCell>
                                    <TableCell sx={{ padding: '4px 8px' }}>{student.address}</TableCell>
                                    <TableCell sx={{ padding: '4px 8px' }}>{student.isActive ? 'Yes' : 'No'}</TableCell>
                                    <TableCell sx={{ padding: '4px 8px' }}>
                                        <Tooltip title="Gửi thông báo">
                                            <IconButton 
                                                color="primary" 
                                                onClick={() => handleOpenDialog(student.userId)}
                                                size="small"
                                            >
                                                <EmailIcon />
                                            </IconButton>
                                        </Tooltip>
                                        {isAdmin && (
                                            <Tooltip title="Khóa người dùng">
                                                <IconButton
                                                    color="warning"
                                                    size="small"
                                                >
                                                    <LockIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={filteredStudents.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />

            <SendNotiDialog 
                open={openNotiDialog} 
                handleClose={handleCloseOpenNoti} 
                quantity={selectedUsers.length} 
                onSend={handleSend} 
            />

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

            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbarSeverity}
                    variant="filled"
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default NewStudentsTable;
