import React, { useEffect, useState } from 'react';
import { Box, Card, Typography, Grid } from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import Sidebar from '../SideBar';
import apiService from '@/app/untils/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// Định nghĩa interface cho dữ liệu trả về từ API
interface BorrowReturnStatistics {
  totalBorrowReturn: number;
  violations: number;
  borrowReturnByMonth: {
    month: string;
    count: number;
  }[];
  borrowReturnDetails: {
    userName: string;
    userId: string;
    bookTitle: string;
    borrowDate: string;
    returnDate: string | null;
    status: 'On Time' | 'Late';
  }[];
}

interface BorrowReturnResponse {
  code: number;
  message: string;
  result: BorrowReturnStatistics;
}

const BorrowReturnDashboard: React.FC = () => {
  const [data, setData] = useState<BorrowReturnStatistics>({
    totalBorrowReturn: 0,
    violations: 0,
    borrowReturnByMonth: [],
    borrowReturnDetails: [],
  });

  // Fetch API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.get<BorrowReturnResponse>('/api/v1/borrow-return/statistics');
        setData(response.data.result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Dữ liệu cho biểu đồ cột (Borrow/Return by Month)
  const barData = {
    labels: data.borrowReturnByMonth.map((entry) => entry.month),
    datasets: [
      {
        label: 'Borrow/Return Activities',
        data: data.borrowReturnByMonth.map((entry) => entry.count),
        backgroundColor: '#3f51b5',
        borderColor: '#303f9f',
        borderWidth: 1,
      },
    ],
  };

  // Dữ liệu cho biểu đồ tròn (Violations)
  const pieData = {
    labels: ['Violations', 'Non-Violations'],
    datasets: [
      {
        data: [
          data.violations,
          data.totalBorrowReturn - data.violations,
        ],
        backgroundColor: ['#f44336', '#4caf50'],
        hoverBackgroundColor: ['#d32f2f', '#388e3c'],
      },
    ],
  };

  return (
    <Box display="flex" height="100vh">
      {/* Sidebar */}
      <Sidebar />

      <Box flex={1} padding={3} bgcolor="#f5f5f5" overflow="auto">
        <Grid container spacing={2}>
          {/* Tổng Số Lượt Mượn Trả */}
          <Grid item xs={12}>
            <Card
              sx={{
                padding: 3,
                textAlign: 'center',
                backgroundColor: '#424242',
                color: '#fff',
              }}
            >
              <Typography variant="h6">Total Borrow/Return Activities</Typography>
              <Typography variant="h4">{data.totalBorrowReturn}</Typography>
            </Card>
          </Grid>

          {/* Số Lượng Vi Phạm */}
          <Grid item xs={12}>
            <Card
              sx={{
                padding: 3,
                textAlign: 'center',
                backgroundColor: '#f44336',
                color: '#fff',
              }}
            >
              <Typography variant="h6">Total Violations</Typography>
              <Typography variant="h4">{data.violations}</Typography>
            </Card>
          </Grid>

          {/* Bảng Thống Kê Hoạt Động Mượn Trả */}
          <Grid item xs={12}>
            <Card sx={{ padding: 3 }}>
              <Typography variant="h6" gutterBottom>
                Borrow/Return Details
              </Typography>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px' }}>User Name</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>User ID</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Book Title</th>
                    <th style={{ textAlign: 'center', padding: '8px' }}>Borrow Date</th>
                    <th style={{ textAlign: 'center', padding: '8px' }}>Return Date</th>
                    <th style={{ textAlign: 'center', padding: '8px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.borrowReturnDetails.map((detail, index) => (
                    <tr key={index}>
                      <td style={{ textAlign: 'left', padding: '8px' }}>{detail.userName}</td>
                      <td style={{ textAlign: 'left', padding: '8px' }}>{detail.userId}</td>
                      <td style={{ textAlign: 'left', padding: '8px' }}>{detail.bookTitle}</td>
                      <td style={{ textAlign: 'center', padding: '8px' }}>{detail.borrowDate}</td>
                      <td style={{ textAlign: 'center', padding: '8px' }}>
                        {detail.returnDate || 'Not Returned'}
                      </td>
                      <td style={{ textAlign: 'center', padding: '8px' }}>{detail.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </Grid>

          {/* Biểu Đồ Số Lượt Mượn Trả Theo Tháng */}
          <Grid item xs={12} md={6}>
            <Card sx={{ padding: 3 }}>
              <Typography variant="h6" gutterBottom>
                Borrow/Return Activities (Bar Chart)
              </Typography>
              <Box height="300px">
                <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
              </Box>
            </Card>
          </Grid>

          {/* Biểu Đồ Vi Phạm */}
          <Grid item xs={12} md={6}>
            <Card sx={{ padding: 3 }}>
              <Typography variant="h6" gutterBottom>
                Violations (Pie Chart)
              </Typography>
              <Box height="300px">
                <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default BorrowReturnDashboard;
