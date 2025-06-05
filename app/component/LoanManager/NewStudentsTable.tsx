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
    InputLabel,
    Chip
} from '@mui/material';
import apiService from '../../untils/api';
import EmailIcon from '@mui/icons-material/Email';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import SendNotiDialog from './SendNotiDiolog';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

interface User {
    userId: string;
    firstName: string;
    lastName: string;
    username: string;
    address: string;
    isActive: string;
    roles?: string[];
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
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

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
        let filtered = students;
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(student => 
                (student.firstName || '').toLowerCase().includes(query) ||
                (student.lastName || '').toLowerCase().includes(query) ||
                (student.username || '').toLowerCase().includes(query) ||
                (student.address || '').toLowerCase().includes(query)
            );
        }
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(student => statusFilter === 'ACTIVE' ? student.isActive === 'ACTIVE' : student.isActive === 'LOCKED');
        }
        if (selectedRole === 'manager') {
            filtered = filtered.filter(student => student.roles && student.roles.includes('MANAGER'));
        } else if (selectedRole === 'user') {
            filtered = filtered.filter(student => !student.roles || !student.roles.includes('MANAGER'));
        }
        setFilteredStudents(filtered);
    }, [searchQuery, students, statusFilter, selectedRole]);

    const fetchStudents = async () => {
        try {
            const response = await apiService.get<{ data: { content: User[] } }>(
                '/api/v1/users',
                // { params: { role: selectedRole } }
            );
            console.log("Response", response);
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

    // Khóa/mở khóa user
    const handleToggleLockUser = async (userId: string, isLocked: boolean) => {
        try {
            if (isLocked) {
                // Mở khóa tài khoản
                await apiService.patch(`/api/v1/users/${userId}/unlock`);
                setSnackbarMessage('Đã mở khóa tài khoản thành công!');
            } else {
                // Khóa tài khoản
                await apiService.patch(`/api/v1/users/${userId}/lock`);
                setSnackbarMessage('Đã khóa tài khoản thành công!');
            }
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
            fetchStudents();
        } catch (error) {
            setSnackbarMessage('Có lỗi xảy ra khi cập nhật trạng thái tài khoản');
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
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                }
                            }}
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
                                            sx={{ 
                                                borderRadius: 1,
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                                }
                                            }}
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
                                sx={{
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderRadius: 2,
                                    }
                                }}
                            >
                                <MenuItem value="user">User</MenuItem>
                                {isAdmin && <MenuItem value="manager">Manager</MenuItem>}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="status-select-label">Trạng thái</InputLabel>
                            <Select
                                labelId="status-select-label"
                                id="status-select"
                                value={statusFilter}
                                label="Trạng thái"
                                onChange={(e) => setStatusFilter(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderRadius: 2,
                                    }
                                }}
                            >
                                <MenuItem value="ALL">Tất cả</MenuItem>
                                <MenuItem value="ACTIVE">Đang hoạt động</MenuItem>
                                <MenuItem value="LOCKED">Đã khóa</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>

            <TableContainer 
                component={Paper} 
                sx={{ 
                    mt: 2,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: `1px solid ${theme.palette.divider}`
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: theme.palette.grey[200] }}>
                            <TableCell padding="checkbox" sx={{ fontWeight: 600, px: 2, py: 1.5, borderBottom: `2px solid ${theme.palette.divider}` }}>
                                <Checkbox
                                    indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredStudents.length}
                                    checked={selectedUsers.length === filteredStudents.length && filteredStudents.length > 0}
                                    onChange={handleSelectAll}
                                    sx={{
                                        '& .MuiSvgIcon-root': {
                                            borderRadius: 1
                                        }
                                    }}
                                />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, px: 2, py: 1.5, borderBottom: `2px solid ${theme.palette.divider}` }}>First Name</TableCell>
                            <TableCell sx={{ fontWeight: 600, px: 2, py: 1.5, borderBottom: `2px solid ${theme.palette.divider}` }}>Last Name</TableCell>
                            <TableCell sx={{ fontWeight: 600, px: 2, py: 1.5, borderBottom: `2px solid ${theme.palette.divider}` }}>Username</TableCell>
                            <TableCell sx={{ fontWeight: 600, px: 2, py: 1.5, borderBottom: `2px solid ${theme.palette.divider}` }}>Address</TableCell>
                            <TableCell sx={{ fontWeight: 600, px: 2, py: 1.5, borderBottom: `2px solid ${theme.palette.divider}` }}>Role</TableCell>
                            <TableCell sx={{ fontWeight: 600, px: 2, py: 1.5, borderBottom: `2px solid ${theme.palette.divider}` }}>Is Active</TableCell>
                            <TableCell sx={{ fontWeight: 600, px: 2, py: 1.5, borderBottom: `2px solid ${theme.palette.divider}` }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredStudents
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    Không có dữ liệu nào được tìm thấy
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredStudents
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((student) => (
                                    <TableRow 
                                        key={student.userId}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: theme.palette.action.hover
                                            },
                                            fontSize: 15
                                        }}
                                    >
                                        <TableCell padding="checkbox" sx={{ px: 2, py: 1.5 }}>
                                            <Checkbox
                                                checked={selectedUsers.includes(student.userId)}
                                                onChange={() => handleSelectUser(student.userId)}
                                                sx={{
                                                    '& .MuiSvgIcon-root': {
                                                        borderRadius: 1
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontSize: 15, px: 2, py: 1.5 }}>{student.firstName}</TableCell>
                                        <TableCell sx={{ fontSize: 15, px: 2, py: 1.5 }}>{student.lastName}</TableCell>
                                        <TableCell sx={{ fontSize: 15, px: 2, py: 1.5 }}>{student.username}</TableCell>
                                        <TableCell sx={{ fontSize: 15, px: 2, py: 1.5 }}>{student.address}</TableCell>
                                        <TableCell sx={{ fontSize: 15, px: 2, py: 1.5 }}>{(student.roles && student.roles.length > 0) ? student.roles.join(', ') : 'user'}</TableCell>
                                        <TableCell sx={{ fontSize: 15, px: 2, py: 1.5 }}>
                                            {student.isActive === 'LOCKED' ? (
                                                <Chip label="Đã khóa" color="error" size="small" sx={{ borderRadius: 2, fontSize: 14, height: 24 }} />
                                            ) : (
                                                <Chip label="Đang hoạt động" color="success" size="small" sx={{ borderRadius: 2, fontSize: 14, height: 24 }} />
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: 15, px: 2, py: 1.5 }}>
                                            <Tooltip title="Gửi thông báo">
                                                <IconButton 
                                                    color="primary" 
                                                    onClick={() => handleOpenDialog(student.userId)}
                                                    size="small"
                                                    sx={{ 
                                                        borderRadius: 1,
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                                        }
                                                    }}
                                                >
                                                    <EmailIcon />
                                                </IconButton>
                                            </Tooltip>
                                            {isAdmin && (
                                                <Tooltip title={student.isActive === 'LOCKED' ? 'Mở khóa người dùng' : 'Khóa người dùng'}>
                                                    <IconButton
                                                        color={student.isActive === 'LOCKED' ? 'success' : 'warning'}
                                                        size="small"
                                                        sx={{ 
                                                            borderRadius: 1,
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                                            }
                                                        }}
                                                        onClick={() => handleToggleLockUser(student.userId, student.isActive === 'LOCKED')}
                                                    >
                                                        {student.isActive === 'LOCKED' ? <LockOpenIcon /> : <LockIcon />}
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ 
                mt: 2, 
                display: 'flex', 
                justifyContent: 'flex-end',
                '& .MuiTablePagination-root': {
                    borderRadius: 2,
                }
            }}>
                <TablePagination
                    component="div"
                    count={filteredStudents.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                    labelRowsPerPage="Số hàng mỗi trang"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên ${count}`}
                />
            </Box>

            <SendNotiDialog 
                open={openNotiDialog} 
                handleClose={handleCloseOpenNoti} 
                quantity={selectedUsers.length} 
                onSend={handleSend} 
            />

            <Dialog 
                open={openDialog} 
                onClose={handleCloseDialog}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        overflow: 'hidden'
                    }
                }}
            >
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
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            }
                        }}
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
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={handleCloseDialog} 
                        sx={{ 
                            borderRadius: 2,
                            textTransform: 'none'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSendNotification} 
                        variant="contained"
                        sx={{ 
                            borderRadius: 2,
                            textTransform: 'none'
                        }}
                    >
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
                    sx={{ 
                        borderRadius: 2,
                        boxShadow: theme.shadows[2]
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default NewStudentsTable;
