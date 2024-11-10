import React from 'react';
import { Box, Card, Typography, Grid, Divider, CircularProgress } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const BorrowReturnStatistics: React.FC = () => {
  // Dữ liệu giả cho thống kê mượn trả
  const borrowReturnData = [
    { id: 1, department: 'Công nghệ thông tin', borrows: 100, returns: 95 },
    { id: 2, department: 'Kinh tế', borrows: 80, returns: 70 },
    { id: 3, department: 'Kỹ thuật', borrows: 60, returns: 55 },
  ];

  const columns: GridColDef[] = [
    { field: 'department', headerName: 'Ngành Học/Khoa', width: 200 },
    { field: 'borrows', headerName: 'Lượt Mượn', width: 150 },
    { field: 'returns', headerName: 'Lượt Trả', width: 150 },
  ];

  return (
    <Box padding={4} bgcolor="#f5f5f5">
      <Typography variant="h4" gutterBottom>
        Thống Kê Mượn Trả
      </Typography>
      <Grid container spacing={3} marginBottom={4}>
        {borrowReturnData.map((item) => (
          <Grid item xs={4} key={item.id}>
            <Card sx={{ padding: 3, textAlign: 'center' }}>
              <Typography variant="h6">{item.department}</Typography>
              <Typography variant="h5">Lượt Mượn: {item.borrows}</Typography>
              <Typography variant="h5">Lượt Trả: {item.returns}</Typography>
              <CircularProgress
                variant="determinate"
                value={(item.returns / item.borrows) * 100}
                size={80}
                color="primary"
                sx={{ marginTop: 2 }}
              />
              <Typography variant="body2">Trả đúng hạn: {(item.returns / item.borrows) * 100}%</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Divider />
      <Typography variant="h6" marginTop={3}>
        Thống Kê Mượn Trả Theo Khoa
      </Typography>
      <Box height={400} marginTop={2}>
        <DataGrid rows={borrowReturnData} columns={columns}  paginationModel={{ pageSize: 5, page: 0 }}  />
      </Box>
    </Box>
  );
};

export default BorrowReturnStatistics;
