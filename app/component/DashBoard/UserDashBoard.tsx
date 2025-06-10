import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import dashboardService, { DashboardStatistics } from '../../services/dashboardService';
import Sidebar from '../SideBar';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';

const UserDashBoard: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getAllStatistics();
        setStatistics(data);
        setError(null);
      } catch (err) {
        setError('Không thể tải thống kê người dùng');
        console.error('Lỗi khi tải thống kê người dùng:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex">
        <Sidebar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" flexGrow={1}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex">
        <Sidebar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" flexGrow={1}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Box>
    );
  }

  if (!statistics) {
    return null;
  }

  return (
    <Box display="flex">
      <Sidebar />
      <Box sx={{ flexGrow: 1, p: 3, backgroundColor: theme.palette.background.default }}>
        <Typography variant="h4" gutterBottom sx={{ 
          color: theme.palette.primary.main,
          fontWeight: 'bold',
          mb: 4 
        }}>
          User Management Dashboard
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: theme.shadows[4] } }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PeopleIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }} />
                  <Typography color="textSecondary" variant="h6">Tổng người dùng</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>{statistics.users.totalUsers}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: theme.shadows[4] } }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonIcon sx={{ fontSize: 40, color: theme.palette.success.main, mr: 2 }} />
                  <Typography color="textSecondary" variant="h6">Người dùng hoạt động</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>{statistics.users.activeUsers}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: theme.shadows[4] } }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonAddIcon sx={{ fontSize: 40, color: theme.palette.info.main, mr: 2 }} />
                  <Typography color="textSecondary" variant="h6">Người dùng mới</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.info.main }}>{statistics.users.newUsers}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: theme.shadows[4] } }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonAddIcon sx={{ fontSize: 40, color: theme.palette.error.main, mr: 2 }} />
                  <Typography color="textSecondary" variant="h6">Tổng số tiền phạt</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.error.main }}>{statistics.fines.totalFines.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: theme.shadows[4] } }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonAddIcon sx={{ fontSize: 40, color: theme.palette.warning.main, mr: 2 }} />
                  <Typography color="textSecondary" variant="h6">Số giao dịch phạt</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.warning.main }}>{statistics.fines.totalFineTransactions}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: theme.shadows[4] } }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonAddIcon sx={{ fontSize: 40, color: theme.palette.success.main, mr: 2 }} />
                  <Typography color="textSecondary" variant="h6">Số tiền phạt đã thanh toán</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>{statistics.fines.paidFines.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: theme.shadows[4] } }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonAddIcon sx={{ fontSize: 40, color: theme.palette.info.main, mr: 2 }} />
                  <Typography color="textSecondary" variant="h6">Số giao dịch phạt đã thanh toán</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.info.main }}>{statistics.fines.paidTransactions}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: theme.shadows[4] } }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonAddIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }} />
                  <Typography color="textSecondary" variant="h6">Tổng số tiền thanh toán</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>{statistics.payments.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: theme.shadows[4] } }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonAddIcon sx={{ fontSize: 40, color: theme.palette.success.main, mr: 2 }} />
                  <Typography color="textSecondary" variant="h6">Số giao dịch thanh toán</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>{statistics.payments.totalPayments}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: theme.shadows[4] } }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonAddIcon sx={{ fontSize: 40, color: theme.palette.info.main, mr: 2 }} />
                  <Typography color="textSecondary" variant="h6">Số giao dịch VNPay</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.info.main }}>{statistics.payments.vnpayPayments}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: theme.shadows[4] } }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonAddIcon sx={{ fontSize: 40, color: theme.palette.warning.main, mr: 2 }} />
                  <Typography color="textSecondary" variant="h6">Số giao dịch tiền mặt</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.warning.main }}>{statistics.payments.cashPayments}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default UserDashBoard;
