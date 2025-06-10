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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const LoanDashBoard: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs().endOf('month'));

  const fetchData = async (start: Dayjs | null, end: Dayjs | null) => {
    if (!start || !end) return;
    try {
      setLoading(true);
      const data = await dashboardService.getLoanStatisticsByDateRange(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
      setStatistics(data);
      setError(null);
    } catch (err) {
      setError('Không thể tải thống kê mượn sách');
      console.error('Lỗi khi tải thống kê mượn sách:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(startDate, endDate);
    // eslint-disable-next-line
  }, [startDate, endDate]);

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

  const loansByStatusData = statistics.loansByStatus
    ? Object.entries(statistics.loansByStatus).map(([status, count]) => ({ name: status, value: count }))
    : [];

  const loanData = [
    { name: 'Total Returns', value: statistics.totalReturns },
    { name: 'Total Loans', value: statistics.totalLoans },
    { name: 'Active Loans', value: statistics.activeLoans },
    { name: 'Overdue Loans', value: statistics.overdueLoans },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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

          {/* Date Range Pickers */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <DatePicker
              label="Từ ngày"
              value={startDate}
              onChange={setStartDate}
              maxDate={endDate || undefined}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
            <DatePicker
              label="Đến ngày"
              value={endDate}
              onChange={setEndDate}
              minDate={startDate || undefined}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Box>

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
                      Tổng lượt trả
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                    {statistics.totalReturns}
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
                      Tổng lượt mượn
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.info.main }}>
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
                    <WarningIcon sx={{ fontSize: 40, color: theme.palette.error.main, mr: 2 }} />
                    <Typography color="textSecondary" variant="h6">
                      Đang mượn
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.error.main }}>
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
                    <HistoryIcon sx={{ fontSize: 40, color: theme.palette.success.main, mr: 2 }} />
                    <Typography color="textSecondary" variant="h6">
                      Quá hạn
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                    {statistics.overdueLoans}
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
                  Thống kê lượt mượn theo trạng thái
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={loansByStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip 
                      formatter={(value: number) => [`${value} lượt`, 'Số lượng']}
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
    </LocalizationProvider>
  );
};

export default LoanDashBoard;
