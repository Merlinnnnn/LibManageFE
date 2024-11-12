import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import Sidebar from '../SideBar';

const LibraryMap = () => {
    return (
        <Box display="flex" height="100vh">
            <Sidebar />
            <Box flex={1} p={3} overflow="auto" height="100vh">
                <Box sx={{ textAlign: 'center', marginTop: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Library Map
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Find this book at highlighted rack and shelf
                    </Typography>

                    {/* Container cho các kệ */}
                    <Grid container spacing={2} justifyContent="center" alignItems="flex-start" style={{ maxWidth: 600, margin: 'auto' }}>

                        {/* Kệ 1 */}
                        <Grid item>
                            <Typography variant="subtitle1" gutterBottom>Kệ 1</Typography>
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <Paper elevation={3} sx={{ width: 50, height: 50, backgroundColor: 'orange' }}>
                                    <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                                        <Typography>A</Typography>
                                    </Box>
                                </Paper>
                                <Paper elevation={3} sx={{ width: 50, height: 50, marginTop: 1 }}>
                                    <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                                        <Typography>B</Typography>
                                    </Box>
                                </Paper>
                            </Box>
                        </Grid>

                        {/* Kệ 2 */}
                        <Grid item>
                            <Typography variant="subtitle1" gutterBottom>Kệ 2</Typography>
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <Paper elevation={3} sx={{ width: 50, height: 50 }}>
                                    <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                                        <Typography>A</Typography>
                                    </Box>
                                </Paper>
                            </Box>
                        </Grid>

                        {/* Kệ 3 - nếu cần thêm kệ */}
                        <Grid item>
                            <Typography variant="subtitle1" gutterBottom>Kệ 3</Typography>
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <Paper elevation={3} sx={{ width: 50, height: 50 }}>
                                    <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                                        <Typography>A</Typography>
                                    </Box>
                                </Paper>
                                <Paper elevation={3} sx={{ width: 50, height: 50, marginTop: 1 }}>
                                    <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                                        <Typography>B</Typography>
                                    </Box>
                                </Paper>
                                <Paper elevation={3} sx={{ width: 50, height: 50, marginTop: 1 }}>
                                    <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                                        <Typography>C</Typography>
                                    </Box>
                                </Paper>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
};

export default LibraryMap;
