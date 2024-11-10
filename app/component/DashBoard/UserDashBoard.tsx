import React from 'react';
import { Box, Card, Typography, Grid, Divider, CircularProgress } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const UserStatistics: React.FC = () => {
  // Dữ liệu giả cho người dùng
  const userRolesData = [
    { id: 1, role: 'Sinh viên', count: 150, percentage: 60 },
    { id: 2, role: 'Giảng viên', count: 80, percentage: 32 },
    { id: 3, role: 'Nhân viên', count: 20, percentage: 8 },
  ];

  const columns: GridColDef[] = [
    { field: 'role', headerName: 'Loại Người Dùng', width: 150 },
    { field: 'count', headerName: 'Số Lượng', width: 130 },
    { field: 'percentage', headerName: 'Tỷ Lệ (%)', width: 130 },
  ];

  return (
    <Box padding={4} bgcolor="#f5f5f5">
      <Typography variant="h4" gutterBottom>
        Thống Kê Người Dùng
      </Typography>
      <Grid container spacing={3} marginBottom={4}>
        {userRolesData.map((item) => (
          <Grid item xs={4} key={item.id}>
            <Card sx={{ padding: 3, textAlign: 'center' }}>
              <Typography variant="h6">{item.role}</Typography>
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
        Phân Loại Người Dùng
      </Typography>
      <Box height={400} marginTop={2}>
        <DataGrid rows={userRolesData} columns={columns}  paginationModel={{ pageSize: 5, page: 0 }}  />
      </Box>
    </Box>
  );
};

export default UserStatistics;
