import React from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';

const RecentSubscriptionsTable: React.FC = () => {
    return (
        <TableContainer component={Paper} style={{ maxHeight: '300px', overflow: 'auto' }}>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>Subscription ID</TableCell>
                        <TableCell>Subscription Name</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {/* Bạn có thể thay thế nội dung này bằng dữ liệu của mình */}
                    <TableRow>
                        <TableCell>1</TableCell>
                        <TableCell>Basic Plan</TableCell>
                        <TableCell>2024-10-01</TableCell>
                        <TableCell>2024-12-31</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default RecentSubscriptionsTable;
