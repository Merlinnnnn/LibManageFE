import React, { useEffect, useState } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Tabs,
    Tab,
} from '@mui/material';
import Sidebar from '../SideBar';
import NewStudentsTable from './NewStudentsTable';
import RecentLoansTable from './RecentLoansTable';
import RecentSubscriptionsTable from './RecentSubscriptionsTable';
import apiService from '@/app/untils/api';

interface DocumentCountResponse {
    result: {
        documentCount: number;
    };
}

interface FinesUnpaidCountResponse {
    result: number;
}

interface UnreturnedDocumentsCountResponse {
    result: number;
}

const LoanManagerPage: React.FC = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const [documentCount, setDocumentCount] = useState<number | null>(null);
    const [unpaidFinesCount, setUnpaidFinesCount] = useState<number | null>(null);
    const [borrowedDocCount, setBorrowedDocCount] = useState<number | null>(null);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    useEffect(() => {
        // fetchDocCount();
        // fetchNewUserCount();
        // fetchBorrowedDocCount();
    }, []);

    const fetchDocCount = async () => {
        try {
            const response = await apiService.get<DocumentCountResponse>('/api/v1/dashboard/documents/count');
            setDocumentCount(response.data.result.documentCount);
            console.log('Số lượng sách: ', response.data.result.documentCount);
        } catch (error) {
            console.error('Lỗi khi lấy số lượng sách:', error);
        }
    };

    const fetchNewUserCount = async () => {
        try {
            const response = await apiService.get<FinesUnpaidCountResponse>('/api/v1/dashboard/fines/unpaid/count');
            setUnpaidFinesCount(response.data.result);
            console.log('Khoản phạt chưa trả: ', response.data.result);
        } catch (error) {
            console.error('Lỗi khi lấy khoản phạt chưa trả:', error);
        }
    };

    const fetchBorrowedDocCount = async () => {
        try {
            const response = await apiService.get<UnreturnedDocumentsCountResponse>('/api/v1/dashboard/documents/unreturned/count');
            setBorrowedDocCount(response.data.result);
            console.log('Số lượng sách đang mượn: ', response.data.result);
        } catch (error) {
            console.error('Lỗi khi lấy số lượng sách đang mượn:', error);
        }
    };

    return (
        <Box display="flex" height="100vh">
            <Sidebar />
            <Box flex={1} p={3} overflow="auto" height="100vh">
                <Typography variant="h4" gutterBottom>
                    Dashboard
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">TOTAL BOOKS</Typography>
                                <Typography variant="h4">{documentCount !== null ? documentCount : 'Loading...'}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">BORROWED BOOKS</Typography>
                                <Typography variant="h4">{borrowedDocCount !== null ? borrowedDocCount : 'Loading...'}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">UNPAID</Typography>
                                <Typography variant="h4">{unpaidFinesCount !== null ? unpaidFinesCount : 'Loading...'}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Box mt={4}>
                    <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
                        <Tab label="NEW STUDENTS" />
                        <Tab label="RECENT LOANS" />
                        <Tab label="RECENT SUBSCRIPTIONS" />
                    </Tabs>
                    <Box mt={2}>
                        {tabIndex === 0 && <NewStudentsTable />}
                        {tabIndex === 1 && <RecentLoansTable />}
                        {tabIndex === 2 && <RecentSubscriptionsTable />}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default LoanManagerPage;
