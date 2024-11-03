import React, { useState } from 'react';
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

const LoanManagerPage: React.FC = () => {
    const [tabIndex, setTabIndex] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    return (
        <Box display="flex" height="100vh">
            <Box width="250px" bgcolor="#333" color="white" height="100vh">
                <Sidebar />
            </Box>

            <Box flex={1} p={3} overflow="auto" height="100vh">
                <Typography variant="h4" gutterBottom>
                    Dashboard
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">TOTAL BOOKS</Typography>
                                <Typography variant="h4">130</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">TOTAL STUDENTS</Typography>
                                <Typography variant="h4">84</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">TOTAL BOOKS LOAN</Typography>
                                <Typography variant="h4">35</Typography>
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
