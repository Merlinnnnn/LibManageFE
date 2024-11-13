import React from 'react';
import { Box, Card, Typography, Grid, Divider, Button, IconButton, Chip } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Sidebar from '../SideBar';

const Dashboard: React.FC = () => {
    return (
        <Box display="flex" height="100vh">
            <Sidebar />
            <Box flex={1} padding={4} bgcolor="#f5f5f5" overflow="auto" height="100vh">
                {/* Header Metrics */}
                <Grid container spacing={3} marginBottom={4}>
                    <Grid item xs={2}>
                        <Card sx={{ padding: 2, textAlign: 'center', backgroundColor: '#424242', color: '#fff' }}>
                            <Typography variant="subtitle1">Total Quantity</Typography>
                            <Typography variant="h4">631,920</Typography>
                            <Typography variant="body2">0.00%</Typography>
                            <IconButton sx={{ color: '#00bcd4', marginTop: 1 }}>
                                <BarChartIcon fontSize="large" />
                            </IconButton>
                        </Card>
                    </Grid>
                    <Grid item xs={2}>
                        <Card sx={{ padding: 2, textAlign: 'center' }}>
                            <Typography variant="subtitle1">Total COGS</Typography>
                            <Typography variant="h4">$180.80M</Typography>
                            <Typography variant="body2">0.00%</Typography>
                            <IconButton sx={{ color: '#00bcd4', marginTop: 1 }}>
                                <AccountBalanceIcon fontSize="large" />
                            </IconButton>
                        </Card>
                    </Grid>
                    <Grid item xs={2}>
                        <Card sx={{ padding: 2, textAlign: 'center' }}>
                            <Typography variant="subtitle1">Total Revenue</Typography>
                            <Typography variant="h4">$307.09M</Typography>
                            <Typography variant="body2">0.00%</Typography>
                            <IconButton sx={{ color: '#00bcd4', marginTop: 1 }}>
                                <AttachMoneyIcon fontSize="large" />
                            </IconButton>
                        </Card>
                    </Grid>
                    <Grid item xs={2}>
                        <Card sx={{ padding: 2, textAlign: 'center' }}>
                            <Typography variant="subtitle1">Total Profit</Typography>
                            <Typography variant="h4">$126.29M</Typography>
                            <Typography variant="body2">0.00%</Typography>
                            <IconButton sx={{ color: '#00bcd4', marginTop: 1 }}>
                                <TrendingUpIcon fontSize="large" />
                            </IconButton>
                        </Card>
                    </Grid>
                    <Grid item xs={2}>
                        <Card sx={{ padding: 2, textAlign: 'center' }}>
                            <Typography variant="subtitle1">% Profit Margin</Typography>
                            <Typography variant="h4">41.12%</Typography>
                            <Typography variant="body2">0.00%</Typography>
                            <IconButton sx={{ color: '#00bcd4', marginTop: 1 }}>
                                <TrendingUpIcon fontSize="large" />
                            </IconButton>
                        </Card>
                    </Grid>
                    <Grid item xs={2}>
                        <Card sx={{ padding: 2, textAlign: 'center', backgroundColor: '#424242', color: '#fff' }}>
                            <Typography variant="subtitle1"># Transaction</Typography>
                            <Typography variant="h4">60.40K</Typography>
                            <Typography variant="body2">0.00%</Typography>
                            <IconButton sx={{ color: '#00bcd4', marginTop: 1 }}>
                                <ShoppingCartIcon fontSize="large" />
                            </IconButton>
                        </Card>
                    </Grid>
                </Grid>

                {/* Transaction & Profit Chart */}
                <Grid container spacing={3} marginBottom={4}>
                    <Grid item xs={6}>
                        <Card sx={{ padding: 3 }}>
                            <Typography variant="h6" color="#00bcd4">
                                93.9% Transaction came from 2008 and 2007
                            </Typography>
                            <Typography color="textSecondary">15,100 Average Transaction</Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center" marginTop={2}>
                                {['2005', '2006', '2007', '2008'].map(year => (
                                    <Box key={year} textAlign="center">
                                        <Typography variant="body1">{year}</Typography>
                                        <Box height={year === '2008' ? 80 : year === '2007' ? 60 : 20} width={20} bgcolor="#00bcd4" marginTop={1} />
                                    </Box>
                                ))}
                            </Box>
                        </Card>
                    </Grid>
                    <Grid item xs={6}>
                        <Card sx={{ padding: 3 }}>
                            <Typography variant="h6" color="#00bcd4">
                                43.8% of Profit came from highlighted weekdays
                            </Typography>
                            <Box display="flex" justifyContent="space-between" marginTop={2}>
                                {['Thu', 'Fri', 'Wed', 'Mon', 'Sat', 'Tue', 'Sun'].map((day, index) => (
                                    <Box key={day} textAlign="center">
                                        <Typography variant="body1">{day}</Typography>
                                        <Box height={100 - index * 5} width={20} bgcolor={index < 3 ? '#00bcd4' : '#c4c4c4'} marginTop={1} />
                                    </Box>
                                ))}
                            </Box>
                        </Card>
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    <Grid item xs={8}>
                        <Card sx={{ padding: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                In 2005 May, Jun, & Dec collectively accounted for 31.9% of total Profit
                            </Typography>
                            <Box display="flex" justifyContent="space-between" marginTop={2}>
                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
                                    <Chip key={month} label={month} color={month === 'May' || month === 'Jun' || month === 'Dec' ? 'primary' : 'default'} />
                                ))}
                            </Box>
                            <Box height={100} bgcolor="grey.200" borderRadius={2} marginTop={3} />
                        </Card>
                    </Grid>
                    <Grid item xs={4}>
                        <Card sx={{ padding: 3 }}>
                            <Typography variant="subtitle1" color="#00bcd4">
                                Month Filter
                            </Typography>
                            <Box display="flex" flexWrap="wrap" justifyContent="center" gap={1} marginTop={2}>
                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
                                    <Button key={month} variant="contained" color="primary" size="small">
                                        {month}
                                    </Button>
                                ))}
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default Dashboard;
