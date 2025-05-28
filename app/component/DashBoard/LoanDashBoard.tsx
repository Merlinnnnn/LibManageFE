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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import dashboardService, { DashboardStatistics } from '../../services/dashboardService';
import Sidebar from '../SideBar';
import BookIcon from '@mui/icons-material/Book';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import HistoryIcon from '@mui/icons-material/History';

const LoanDashBoard: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<DashboardStatistics['loans'] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getLoanStatistics();
        setStatistics(data);
        setError(null);
      } catch (err) {
        setError('Không thể tải thống kê mượn sách');
        console.error('Lỗi khi tải thống kê mượn sách:', err);
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

  const loanData = [
    { name: 'Active Loans', value: statistics.activeLoans },
    { name: 'Overdue Loans', value: statistics.overdueLoans },
    { name: 'Recent Loans', value: statistics.recentLoans },
  ];

  return (
    <Box display="flex">
      <Sidebar />
      <Box sx={{ flexGrow: 1, p: 3, backgroundColor: theme.palette.background.default }}>
        <Typography variant="h4" gutterBottom sx={{ 
          color: theme.palette.primary.main,
          fontWeight: 'bold',
          mb: 4 
        }}>
          Loan Management Dashboard
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[4]
              }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <BookIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }} />
                  <Typography color="textSecondary" variant="h6">
                    Total Loans
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  {statistics.totalLoans}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[4]
              }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AccessTimeIcon sx={{ fontSize: 40, color: theme.palette.info.main, mr: 2 }} />
                  <Typography color="textSecondary" variant="h6">
                    Active Loans
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.info.main }}>
                  {statistics.activeLoans}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[4]
              }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <WarningIcon sx={{ fontSize: 40, color: theme.palette.error.main, mr: 2 }} />
                  <Typography color="textSecondary" variant="h6">
                    Overdue Loans
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.error.main }}>
                  {statistics.overdueLoans}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[4]
              }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <HistoryIcon sx={{ fontSize: 40, color: theme.palette.success.main, mr: 2 }} />
                  <Typography color="textSecondary" variant="h6">
                    Recent Loans
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                  {statistics.recentLoans}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          {/* Loan Distribution */}
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 3,
              borderRadius: 2,
              boxShadow: theme.shadows[2],
              '&:hover': {
                boxShadow: theme.shadows[4]
              }
            }}>
              <Typography variant="h5" gutterBottom sx={{ 
                color: theme.palette.primary.main,
                fontWeight: 'bold',
                mb: 3 
              }}>
                Loan Distribution Overview
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={loanData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value} lượt mượn`, 'Số lượng']}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 4,
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    fill={theme.palette.primary.main}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default LoanDashBoard;
