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
  Divider,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import dashboardService, { DashboardStatistics } from '../../services/dashboardService';
import Sidebar from '../SideBar';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard: React.FC = () => {
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
        setError('Failed to load dashboard data');
        console.error('Error fetching dashboard data:', err);
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

  const documentData = [
    { name: 'Enabled', value: statistics.documents.documentsByENABLED },
    { name: 'Disabled', value: statistics.documents.documentsByDISABLED },
  ];

  return (
    <Box display="flex" bgcolor="#f5f6fa" minHeight="100vh">
      <Sidebar />
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 5 }, backgroundColor: '#f5f6fa' }}>
        <Typography variant="h4" gutterBottom sx={{ 
          color: 'primary.main',
          fontWeight: 'bold',
          mb: 4,
          textAlign: 'center',
          letterSpacing: 1.5
        }}>
          Thống Kê Quản Trị Hệ Thống
        </Typography>
        <Divider sx={{ mb: 4 }} />
        {/* Summary Cards */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 4,
              boxShadow: 4,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 8
              },
              bgcolor: '#fff'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PeopleIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
                  <Typography color="textSecondary" variant="h6" fontWeight={600}>
                    Tổng người dùng
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main', textAlign: 'center' }}>
                  {statistics.users.totalUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 4,
              boxShadow: 4,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 8
              },
              bgcolor: '#fff'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonIcon sx={{ fontSize: 48, color: 'success.main', mr: 2 }} />
                  <Typography color="textSecondary" variant="h6" fontWeight={600}>
                    Người dùng hoạt động
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'success.main', textAlign: 'center' }}>
                  {statistics.users.activeUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 4,
              boxShadow: 4,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 8
              },
              bgcolor: '#fff'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonAddIcon sx={{ fontSize: 48, color: 'info.main', mr: 2 }} />
                  <Typography color="textSecondary" variant="h6" fontWeight={600}>
                    Người dùng mới
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'info.main', textAlign: 'center' }}>
                  {statistics.users.newUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {/* Charts */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, borderRadius: 4, boxShadow: 3, bgcolor: '#fff', '&:hover': { boxShadow: 6 } }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mb: 3 }}>
                Hoạt động hàng ngày
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[statistics.daily]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="newLoans" fill="#8884d8" name="Mượn mới" />
                  <Bar dataKey="returns" fill="#82ca9d" name="Trả sách" />
                  <Bar dataKey="payments" fill="#ffc658" name="Thanh toán" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, borderRadius: 4, boxShadow: 3, bgcolor: '#fff', '&:hover': { boxShadow: 6 } }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mb: 3 }}>
                Phân bố vai trò người dùng
              </Typography>
              <Box sx={{ height: 350, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Array.isArray(statistics.users.roleDistribution) ? statistics.users.roleDistribution : []}
                      dataKey="count"
                      nameKey="role"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ role, percent }) => `${role}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {Array.isArray(statistics.users.roleDistribution) && statistics.users.roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value} người dùng`, 'Số lượng']}
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 4,
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 500 }}>
                  Tổng số người dùng: {statistics.users.totalUsers}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
