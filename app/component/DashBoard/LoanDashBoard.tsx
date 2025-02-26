import React, { useEffect, useState } from 'react';
import { Box, Card, Typography, Grid, Button, TextField } from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import Sidebar from '../SideBar';
import apiService from '@/app/untils/api';
import { useThemeContext } from '../Context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface BorrowReturnDetails {
  userName: string;
  userId: string;
  bookTitle: string;
  borrowDate: string;
  returnDate: string | null;
  status: 'On Time' | 'Late';
}

interface BorrowReturnStatistics {
  totalBorrowReturn: number;
  violations: number;
  borrowReturnByMonth: {
    month: string;
    count: number;
  }[];
  borrowReturnDetails: BorrowReturnDetails[];
}

interface LoanStatistics {
  loansByMonth: { month: number; loanCount: number }[];
  violatorsCount: number;
}

const BorrowReturnDashboard: React.FC = () => {
  const { mode } = useThemeContext();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<string>(currentYear.toString());
  const [viewYear, setViewYear] = useState<string>(currentYear.toString());
  const [data, setData] = useState<BorrowReturnStatistics>({
    totalBorrowReturn: 0,
    violations: 0,
    borrowReturnByMonth: [],
    borrowReturnDetails: [],
  });
  const [statusSummary, setStatusSummary] = useState<{ RETURNED: number; PENDING: number; REJECTED: number }>({
    RETURNED: 0,
    PENDING: 0,
    REJECTED: 0,
  });
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [totalLoans, setTotalLoans] = useState<number>(0);
  const [violatorsCount, setViolatorsCount] = useState<number>(0);

  // Hàm gọi API mượn trả theo năm (biểu đồ cột)
  const fetchBorrowReturnByYear = async () => {
    try {
      const monthlyData: { month: string; count: number }[] = [];
      for (let month = 1; month <= 12; month++) {
        const response = await apiService.get<{
          code: number;
          result: { loanTransactionCount: number };
        }>(`/api/v1/dashboards/loans/count?year=${viewYear}&month=${month}`);
        monthlyData.push({
          month: `Tháng ${month}`,
          count: response.data.result.loanTransactionCount || 0,
        });
      }
      setData((prevData) => ({
        ...prevData,
        borrowReturnByMonth: monthlyData,
      }));
    } catch (error) {
      console.log('Error fetching borrow/return data by year:', error);
    }
  };


  const fetchBorrowReturnActivities = async () => {
    if (!startDate || !endDate) return;
    try {
      const response = await apiService.get<{
        code: number;
        result: {
          statusSummary: { RETURNED: number; PENDING: number; REJECTED: number };
        };
      }>(`/api/v1/dashboards/loans/activities?startDate=${startDate}&endDate=${endDate}`);
      setStatusSummary(response.data.result.statusSummary);
    } catch (error) {
      console.log('Error fetching activities data:', error);
    }
  };

  // Hàm gọi API cho biểu đồ tròn mới
  const fetchLoanStatistics = async () => {
    try {
      const response = await apiService.get<{
        code: number;
        result: LoanStatistics;
      }>(`/api/v1/dashboards/loans/statistics`);
      const { loansByMonth, violatorsCount } = response.data.result;

      setViolatorsCount(violatorsCount);
      const totalLoanCount = loansByMonth.reduce((sum, item) => sum + item.loanCount, 0);
      setTotalLoans(totalLoanCount);
    } catch (error) {
      console.log('Error fetching loan statistics:', error);
    }
  };

  // Tự động gọi API khi chọn đủ ngày
  useEffect(() => {
    if (startDate && endDate) {
      fetchBorrowReturnActivities();
    }
  }, [startDate, endDate]);

  // Gọi API loan statistics khi khởi động trang
  useEffect(() => {
    fetchLoanStatistics();
  }, []);

  const handleViewYear = () => {
    setViewYear(year);
    fetchBorrowReturnByYear();
  };

  const barData = {
    labels: data.borrowReturnByMonth.map((item) => item.month),
    datasets: [
      {
        label: 'Borrow/Return by Month',
        data: data.borrowReturnByMonth.map((item) => item.count),
        backgroundColor: '#3f51b5',
      },
    ],
  };

  const pieChartData = {
    labels: ['Returned', 'Pending', 'Rejected'],
    datasets: [
      {
        data: [statusSummary.RETURNED, statusSummary.PENDING, statusSummary.REJECTED],
        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
      },
    ],
  };

  const loanPieChartData = {
    labels: ['Loans Without Violations', 'Loans With Violations'],
    datasets: [
      {
        data: [totalLoans - violatorsCount, violatorsCount],
        backgroundColor: ['#4caf50', '#f44336'],
      },
    ],
  };

  return (
    <Box display="flex" height="100vh" bgcolor={mode === 'light' ? '#ffffff' : '#222428'}>
      <Sidebar />
      <Box flex={1} padding={3}>
        <Grid container spacing={2}>
          {/* Biểu đồ cột */}
          <Grid item xs={12} md={6}>
            <Card sx={{ padding: 3 }}>
              <Typography variant="h6">Borrow/Return by Month</Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <TextField
                  label="Year"
                  type="number"
                  fullWidth
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <Button
                  variant="contained"
                  sx={{ ml: 2 }}
                  onClick={handleViewYear}
                >
                  View
                </Button>
              </Box>
              <Box height="300px">
                <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
              </Box>
            </Card>
          </Grid>

          {/* Biểu đồ tròn cũ */}
          <Grid item xs={12} md={6}>
            <Card sx={{ padding: 3 }}>
              <Typography variant="h6">On Time vs Late Returns</Typography>
              <Box display="flex" mb={2}>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  sx={{ ml: 2 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Box>
              <Box height="300px">
                <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </Box>
            </Card>
          </Grid>

          {/* Biểu đồ tròn mới */}
          <Grid item xs={12}>
            <Card sx={{ padding: 3 }}>
              <Typography variant="h6">Loan Statistics for the Month</Typography>
              <Typography variant="subtitle1">
                Total Loans: {totalLoans}, Violators: {violatorsCount}
              </Typography>
              <Box height="300px">
                <Pie data={loanPieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default BorrowReturnDashboard;
