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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import dashboardService, { DashboardStatistics } from '../../services/dashboardService';
import Sidebar from '../SideBar';
import BookIcon from '@mui/icons-material/Book';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const BookDashBoard: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<DashboardStatistics['documents'] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getDocumentStatistics();
        setStatistics(data);
        setError(null);
      } catch (err) {
        setError('Không thể tải thống kê sách');
        console.error('Lỗi khi tải thống kê sách:', err);
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
    { name: 'Enabled', value: statistics.documentsByENABLED },
    { name: 'Disabled', value: statistics.documentsByDISABLED },
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
          Quản lý sách Dashboard
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
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
                    Tổng sách
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  {statistics.totalDocuments}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
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
                  <CheckCircleIcon sx={{ fontSize: 40, color: theme.palette.success.main, mr: 2 }} />
                  <Typography color="textSecondary" variant="h6">
                    Sách có sẵn
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                  {statistics.documentsByENABLED}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
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
                  <CancelIcon sx={{ fontSize: 40, color: theme.palette.error.main, mr: 2 }} />
                  <Typography color="textSecondary" variant="h6">
                    Sách không có sẵn
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.error.main }}>
                  {statistics.documentsByDISABLED}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          {/* Book Status Distribution */}
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
                Phân bố trạng thái sách
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={documentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {documentData.map((entry, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name === 'Enabled' ? theme.palette.success.main : theme.palette.error.main} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} sách`, 'Số lượng']}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 4,
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default BookDashBoard;
