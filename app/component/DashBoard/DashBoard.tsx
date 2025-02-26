import React, { useEffect, useState } from 'react';
import { Box, Card, Typography, Grid, IconButton } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from 'chart.js';
import Sidebar from '../SideBar';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import apiService from '@/app/untils/api';

ChartJS.register(ArcElement, Tooltip, Legend);

// Định nghĩa interface cho dữ liệu trả về từ API
interface UserRoleData {
    totalUsers: number;
    usersByRole: {
        ADMIN: number;
        MANAGER: number;
        USER: number;
    };
}

interface UserRoleResponse {
    code: number;
    message: string;
    result: UserRoleData;
}

const Dashboard: React.FC = () => {
    const [data, setData] = useState<UserRoleData>({
        totalUsers: 0,
        usersByRole: {
            ADMIN: 0,
            MANAGER: 0,
            USER: 0,
        },
    });

    // Fetch API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiService.get<UserRoleResponse>('/api/v1/dashboards/users/statistics');
                const responseData: UserRoleData = response.data.result;
                setData(responseData);
            } catch (error) {
                console.log('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const pieData = {
        labels: ['ADMIN', 'MANAGER', 'USER'],
        datasets: [
            {
                data: [
                    data.usersByRole.ADMIN || 0,
                    data.usersByRole.MANAGER || 0,
                    data.usersByRole.USER || 0,
                ],
                backgroundColor: ['#3f51b5', '#00bcd4', '#ff5722'],
                hoverBackgroundColor: ['#303f9f', '#008394', '#e64a19'],
            },
        ],
    };

    const pieOptions: ChartOptions<'pie'> = {
        plugins: {
            legend: {
                display: true,
                position: 'right',
                labels: {
                    boxWidth: 20, 
                    padding: 10,
                },
            },
        },
        maintainAspectRatio: true, 
    };
    

    return (
        <Box display="flex" height="100vh">
            {/* Sidebar */}
            <Sidebar />

            <Box flex={1} padding={3} bgcolor="#f5f5f5" overflow="auto">
                <Grid container spacing={2}>
                    {/* Total Users Card */}
                    <Grid item xs={12}>
                        <Card
                            sx={{
                                padding: 3,
                                textAlign: 'center',
                                backgroundColor: '#424242',
                                color: '#fff',
                            }}
                        >
                            <Typography variant="h6">Total Users</Typography>
                            <Typography variant="h4">{data.totalUsers}</Typography>
                        </Card>
                    </Grid>

                    {/* Role Cards */}
                        {/* Card Admin */}
                        <Grid item xs={4}>
                            <Card
                                sx={{
                                    padding: 2,
                                    textAlign: 'center',
                                    backgroundColor: '#424242',
                                    color: '#fff',
                                }}
                            >
                                <Typography variant="subtitle1">Admin</Typography>
                                <Typography variant="h4">
                                    {data.usersByRole.ADMIN || 0}
                                </Typography>
                                <Typography variant="body2">
                                    {data.totalUsers > 0
                                        ? `${(
                                              ((data.usersByRole.ADMIN || 0) / data.totalUsers) *
                                              100
                                          ).toFixed(2)}%`
                                        : '0.00%'}
                                </Typography>
                                <IconButton sx={{ color: '#00bcd4', marginTop: 1 }}>
                                    <AdminPanelSettingsIcon fontSize="large" />
                                </IconButton>
                            </Card>
                        </Grid>

                        {/* Card Manager */}
                        <Grid item xs={4}>
                            <Card
                                sx={{
                                    padding: 2,
                                    textAlign: 'center',
                                    backgroundColor: '#424242',
                                    color: '#fff',
                                }}
                            >
                                <Typography variant="subtitle1">Manager</Typography>
                                <Typography variant="h4">
                                    {data.usersByRole.MANAGER || 0}
                                </Typography>
                                <Typography variant="body2">
                                    {data.totalUsers > 0
                                        ? `${(
                                              ((data.usersByRole.MANAGER || 0) / data.totalUsers) *
                                              100
                                          ).toFixed(2)}%`
                                        : '0.00%'}
                                </Typography>
                                <IconButton sx={{ color: '#00bcd4', marginTop: 1 }}>
                                    <ManageAccountsIcon fontSize="large" />
                                </IconButton>
                            </Card>
                        </Grid>

                        {/* Card User */}
                        <Grid item xs={4}>
                            <Card
                                sx={{
                                    padding: 2,
                                    textAlign: 'center',
                                    backgroundColor: '#424242',
                                    color: '#fff',
                                }}
                            >
                                <Typography variant="subtitle1">User</Typography>
                                <Typography variant="h4">
                                    {data.usersByRole.USER || 0}
                                </Typography>
                                <Typography variant="body2">
                                    {data.totalUsers > 0
                                        ? `${(
                                              ((data.usersByRole.USER || 0) / data.totalUsers) *
                                              100
                                          ).toFixed(2)}%`
                                        : '0.00%'}
                                </Typography>
                                <IconButton sx={{ color: '#00bcd4', marginTop: 1 }}>
                                    <PersonIcon fontSize="large" />
                                </IconButton>
                            </Card>
                        </Grid>


                    {/* Pie Chart */}
                    <Grid item xs={12}>
                        <Card sx={{ padding: 2, marginTop: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                User Role Distribution
                            </Typography>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Box width="300px" height="300px">
                                    <Pie data={pieData} options={pieOptions}/>
                                </Box>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default Dashboard;
