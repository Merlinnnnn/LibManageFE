import React from 'react';
import { Box, Card, Typography, Grid, Divider, CircularProgress } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const BookStatistics: React.FC = () => {
  // Dữ liệu giả cho sách
  const bookCategoriesData = [
    { id: 1, category: 'Khoa học', count: 120, percentage: 40 },
    { id: 2, category: 'Văn học', count: 80, percentage: 27 },
    { id: 3, category: 'Công nghệ', count: 60, percentage: 20 },
    { id: 4, category: 'Lịch sử', count: 30, percentage: 13 },
  ];

  const columns: GridColDef[] = [
    { field: 'category', headerName: 'Thể Loại', width: 150 },
    { field: 'count', headerName: 'Số Lượng', width: 130 },
    { field: 'percentage', headerName: 'Tỷ Lệ (%)', width: 130 },
  ];

  return (
    <Box padding={4} bgcolor="#f5f5f5">
      <Typography variant="h4" gutterBottom>
        Thống Kê Sách
      </Typography>
      <Grid container spacing={3} marginBottom={4}>
        {bookCategoriesData.map((item) => (
          <Grid item xs={3} key={item.id}>
            <Card sx={{ padding: 3, textAlign: 'center' }}>
              <Typography variant="h6">{item.category}</Typography>
              <Typography variant="h4">{item.count}</Typography>
              <CircularProgress
                variant="determinate"
                value={item.percentage}
                size={80}
                color="primary"
                sx={{ marginTop: 2 }}
              />
              <Typography variant="body2">{item.percentage}%</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Divider />
      <Typography variant="h6" marginTop={3}>
        Thống Kê Trạng Thái Sách
      </Typography>
      <Box height={400} marginTop={2}>
        <DataGrid rows={bookCategoriesData} columns={columns}  paginationModel={{ pageSize: 5, page: 0 }} />
      </Box>
    </Box>
  );
};

export default BookStatistics;
