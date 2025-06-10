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
  const [statusStatistics, setStatusStatistics] = useState<DashboardStatistics['documents'] | null>(null);
  const [typeStatistics, setTypeStatistics] = useState<{ typeDistribution?: Record<string, number>; totalByType?: Record<string, number>; } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statusData, typeData] = await Promise.all([
          dashboardService.getDocumentStatusStatistics(),
          dashboardService.getDocumentTypeStatistics()
        ]);
        setStatusStatistics(statusData);
        setTypeStatistics(typeData);
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

  if (!statusStatistics && !typeStatistics) {
    return null;
  }

  const documentData = statusStatistics ? [
    { name: 'Enabled', value: statusStatistics.documentsByENABLED },
    { name: 'Disabled', value: statusStatistics.documentsByDISABLED },
  ] : [];

  const typeDistributionData = typeStatistics && typeStatistics.typeDistribution
    ? Object.entries(typeStatistics.typeDistribution).map(([type, percent]) => ({ name: type, value: percent }))
    : [];
  const totalByTypeData = typeStatistics && typeStatistics.totalByType
    ? Object.entries(typeStatistics.totalByType).map(([type, count]) => ({ name: type, value: count }))
    : [];

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
                  {statusStatistics?.totalDocuments || 0}
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
                  {statusStatistics?.documentsByENABLED || 0}
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
                  {statusStatistics?.documentsByDISABLED || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          {/* Book Status Distribution */}
          <Grid item xs={12} md={6}>
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
                    outerRadius={120}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {documentData.map((entry, index: number) => (
                      <Cell 
                        key={`cell-status-${index}`} 
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

          {/* Book Type Distribution (Pie Chart) */}
          <Grid item xs={12} md={6}>
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
                Phân bố loại sách (%)
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={typeDistributionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  >
                    {typeDistributionData.map((entry, index: number) => (
                      <Cell key={`cell-type-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'Tỉ lệ']}
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

          {/* Book Type Count (Bar Chart) */}
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
                Số lượng sách theo loại
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={totalByTypeData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value: number) => [`${value} sách`, 'Số lượng']} />
                  <Legend />
                  <Bar dataKey="value" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default BookDashBoard;
