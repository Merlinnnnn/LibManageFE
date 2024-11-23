import React, { useEffect, useState } from 'react';
import { Box, Card, Typography, Grid } from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import Sidebar from '../SideBar';
import apiService from '@/app/untils/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// Định nghĩa interface cho dữ liệu trả về từ API
interface DocumentStatistics {
  totalDocuments: number;
  borrowedDocuments: number;
  availableDocuments: number;
  disabledDocuments: number;
  documentsByType: {
    typeName: string;
    count: number;
  }[];
}

interface DocumentStatisticsResponse {
  code: number;
  message: string;
  result: DocumentStatistics;
}

const BookDashboard: React.FC = () => {
  const [data, setData] = useState<DocumentStatistics>({
    totalDocuments: 0,
    borrowedDocuments: 0,
    availableDocuments: 0,
    disabledDocuments: 0,
    documentsByType: [],
  });

  // Fetch API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.get<DocumentStatisticsResponse>(
          '/api/v1/dashboards/documents/statistics'
        );
        setData(response.data.result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Dữ liệu cho biểu đồ tròn (Books by Status)
  const pieData = {
    labels: ['Borrowed', 'Available', 'Disabled'],
    datasets: [
      {
        data: [
          data.borrowedDocuments,
          data.availableDocuments,
          data.disabledDocuments,
        ],
        backgroundColor: ['#ff5722', '#4caf50', '#f44336'],
        hoverBackgroundColor: ['#e64a19', '#388e3c', '#d32f2f'],
      },
    ],
  };

  // Dữ liệu cho biểu đồ cột (Books by Category)
  const barData = {
    labels: data.documentsByType.map((type) => type.typeName),
    datasets: [
      {
        label: 'Books by Category',
        data: data.documentsByType.map((type) => type.count),
        backgroundColor: '#3f51b5',
        borderColor: '#303f9f',
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box display="flex" height="100vh">
      {/* Sidebar */}
      <Sidebar />

      <Box flex={1} padding={3} bgcolor="#f5f5f5" overflow="auto">
        <Grid container spacing={2}>
          {/* Phần bên trái */}
          <Grid item xs={12} md={8} >
            <Grid
              container
              direction="column"
              alignItems="stretch"
              sx={{
                display: 'flex',      
                flexDirection: 'column', 
                height: '100%'        
              }}
              
              //spacing={2}
            >
              {/* Card Tổng Số Sách */}
              <Grid item sx={{ height: '50%' }}>
                <Card
                  sx={{
                    padding: 3,
                    textAlign: 'center',
                    backgroundColor: '#424242',
                    color: '#fff',
                    height:'95%',
                    
                  }}
                >
                  <Typography variant="h6">Total Documents</Typography>
                  <Typography variant="h4">{data.totalDocuments}</Typography>
                </Card>
              </Grid>

              {/* Các Card Status */}
              <Grid item container alignItems="stretch"sx={{ height: '50%' }}>
                <Grid item xs={4}>
                  <Card
                    sx={{
                      
                      textAlign: 'center',
                      backgroundColor: '#ff5722',
                      color: '#fff',
                      height: '100%',
                      marginRight: 2
                    }}
                  >
                    <Typography variant="h6">Borrowed</Typography>
                    <Typography variant="h4">{data.borrowedDocuments}</Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card
                    sx={{

                      textAlign: 'center',
                      backgroundColor: '#4caf50',
                      color: '#fff',
                      height: '100%',
                    }}
                  >
                    <Typography variant="h6">Available</Typography>
                    <Typography variant="h4">{data.availableDocuments}</Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card
                    sx={{

                      textAlign: 'center',
                      backgroundColor: '#f44336',
                      color: '#fff',
                      height: '100%',
                      marginLeft: 2
                    }}
                  >
                    <Typography variant="h6">Disabled</Typography>
                    <Typography variant="h4">{data.disabledDocuments}</Typography>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={4} alignItems="stretch">
            <Card sx={{ padding: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Documents by Status (Pie Chart)
              </Typography>
              <Box height="300px">
                <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Biểu Đồ Cột và Bảng */}
        <Grid container spacing={2} marginTop={4}>
          {/* Biểu Đồ Cột */}
          <Grid item xs={12} md={6}>
            <Card sx={{ padding: 3, height: '400px' }}>
              <Typography variant="h6" gutterBottom>
                Books by Category (Bar Chart)
              </Typography>
              <Box height="300px">
                <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
              </Box>
            </Card>
          </Grid>

          {/* Bảng Thống Kê Theo Thể Loại */}
          <Grid item xs={12} md={6}>
            <Card sx={{ padding: 3, height: '400px' }}>
              <Typography variant="h6" gutterBottom>
                Books by Category
              </Typography>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Category</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>Count</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {data.documentsByType.map((type) => (
                    <tr key={type.typeName}>
                      <td style={{ textAlign: 'left', padding: '8px' }}>{type.typeName}</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>{type.count}</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>
                        {((type.count / data.totalDocuments) * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default BookDashboard;
